const { WebSocketServer } = require('ws');
const uuid = require('uuid');

function peerProxy(httpServer) {
    // Create a websocket object
    const wss = new WebSocketServer({ noServer: true });

    // Handle the protocol upgrade from HTTP to WebSocket
    httpServer.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
        });
    });

    // Keep track of all the connections
    let connections = {};

    wss.on('connection', (ws, req) => {
        const gameID = req.url.substring(1);
        let connection;

        if (!connections[gameID]) {
            connection = { id: uuid.v4(), alive: true, ws: ws };
            connections[gameID] = [];
            connections[gameID].push(connection);
        } else if (Object.keys(connections[gameID]).length < 2) {
            connection = { id: uuid.v4(), alive: true, ws: ws };
            connections[gameID].push(connection);
        } else {
            // Error, 2 players already connected: Send error message
            ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Two players are already connected to this game.' 
            }));
            ws.close();

            return;
        }

        ws.on('close', () => {
            if (connections[gameID] && connection) {
                delete connections[gameID][connection.id];
                if (Object.keys(connections[gameID]).length === 0) {
                    delete connections[gameID];
                }
            }
        });

        // Respond to pong messages by marking the connection alive
        ws.on('pong', () => {
            connection.alive = true;
        });
    });

    // Keep active connections alive
    setInterval(() => {
        Object.values(connections).forEach((gameConnections) => {
            Object.values(gameConnections).forEach((connection) => {
                // Kill any connection that didn't respond to the ping last time
                if (!connection.alive) {
                    connection.ws.terminate();
                } else {
                    connection.alive = false;
                    connection.ws.ping();
                }
            });
        });
    }, 10000);
}

module.exports = { peerProxy };