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
        console.log('Connected to game with ID:', gameID);

        let connection;
        console.log("Connected Sockets:", connections[gameID]);

        if (!connections[gameID]) {
            console.log("Creating new dict to connect");
            connection = { id: uuid.v4(), alive: true, ws: ws };
            connections[gameID] = [];
            connections[gameID].push(connection);

            ws.send(JSON.stringify({ 
                type: 'establishingConnection', 
                content: `Waiting for another player to join... Have friend join Game ID ${gameID} to join!`,
            }));
        } else if (Object.keys(connections[gameID]).length < 2) {
            console.log("Second Player Connecting");
            connection = { id: uuid.v4(), alive: true, ws: ws };
            connections[gameID].push(connection);

            ws.send(JSON.stringify({ 
                type: 'connectionEstablished', 
                content: `Connected with opponent!`,
            }));
        } else {
            // Error, 2 players already connected: Send error message
            console.log("2 players are already connected");
            ws.send(JSON.stringify({ 
                type: 'error', 
                content: 'Two players are already connected to this game.' 
            }));
            ws.close();

            return;
        }

        ws.on('close', () => {
            console.log('CLOSING CONNECTION');
            if (connections[gameID] && connection) {
                const index = connections[gameID].indexOf(connection);
                if (index !== -1) {
                    connections[gameID].splice(index, 1); // Remove the connection from the array
                    console.log(connections[gameID]);
                    if (connections[gameID].length === 0) {
                        console.log("Removing map key value");
                        delete connections[gameID];
                    }
                }
            }
        });

        // Respond to pong messages by marking the connection alive
        ws.on('pong', () => {
            //console.log("PONG");
            connection.alive = true;
        });
    });

    // Keep active connections alive
    setInterval(() => {
        //console.log("PING");
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