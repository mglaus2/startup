const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Trust headers that are forwarded from the proxy so we can determine IP addresses
app.set('trust proxy', true);

// Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
    console.log("Trying to create user");
    if (await DB.getUser(req.body.username)) {
      res.status(409).send({ msg: 'Existing user' });
    } else {
      const user = await DB.createUser(req.body.username, req.body.password);
  
      // Set the cookie
      setAuthCookie(res, user.token);
  
      res.send({
        id: user._id,
      });
    }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
    console.log("Trying to log user in");
    const user = await DB.getUser(req.body.username);
    if (user) {
        console.log('User exists:', user.token);
        if (await bcrypt.compare(req.body.password, user.password)) {
            setAuthCookie(res, user.token);
            res.send({ id: user._id });
            console.log("authcookiename:", authCookieName);
            return;
        }
        console.log('Passwords do not match');
    }
    res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
    console.log('Logging out user');
    res.clearCookie(authCookieName);
    res.status(204).end();
});
  
// GetUser returns information about a user
apiRouter.get('/user/:username', async (req, res) => {
    console.log("Getting username and token");
    const user = await DB.getUser(req.params.username);
    if (user) {
      const token = req?.cookies.token;
      res.send({ username: user.username, authenticated: token === user.token });
      return;
    }
    res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
    console.log("Checking authtoken");
    authToken = req.cookies[authCookieName];
    console.log("Authtoken:", authToken);
    const user = await DB.getUserByToken(authToken);
    console.log("User:", user);
    if (user) {
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
});

// request needs username and gameID
secureApiRouter.post('/game/join', async (req, res) => {
    let gameState = await DB.getGame(req.body.gameID);
    if (gameState) {
        console.log('Joining Game with GameID:', req.body.gameID);
        console.log('Hostname', gameState.hostname);
        console.log('Username:', req.body.username);
        const hostname = gameState.hostname;
        const opponentName = gameState.opponentName;
        const username = req.body.username;
        
        if(hostname === username) {
            res.send({ 
                hostBoard: gameState.hostBoard,
                opponentBoard: gameState.opponentBoard,
                turn: gameState.turn,
                numShipsToPlaceHost: gameState.numShipsToPlaceHost,
                numShipsToPlaceOpponent: gameState.numShipsToPlaceOpponent,
                numHostLivesLeft: gameState.numHostLivesLeft,
                numOpponentLivesLeft: gameState.numOpponentLivesLeft,
            });
        } else if (opponentName === username) {
            res.send({
                hostBoard: gameState.opponentBoard,
                opponentBoard: gameState.hostBoard,
                turn: gameState.turn,
                numShipsToPlaceHost: gameState.numShipsToPlaceOpponent,
                numShipsToPlaceOpponent: gameState.numShipsToPlaceHost,
                numHostLivesLeft: gameState.numOpponentLivesLeft,
                numOpponentLivesLeft: gameState.numHostLivesLeft,
            });
        } else {
            res.status(401).send({ msg: 'You are not a player to this GameID' });
        }
    } else if (req.body.gameID === null) {
        res.status(401).send({ msg: 'Invalid GameID' });
    } else {
        console.log('Creating Game with GameID:', req.body.gameID);
        gameState = await DB.createGame(req.body.username, req.body.gameID, req.body.opponentName);
        res.send({ 
            hostBoard: gameState.hostBoard,
            opponentBoard: gameState.opponentBoard,
            turn: gameState.turn,
            numShipsToPlaceHost: gameState.numShipsToPlaceHost,
            numShipsToPlaceOpponent: gameState.numShipsToPlaceOpponent,
            numHostLivesLeft: gameState.numHostLivesLeft,
            numOpponentLivesLeft: gameState.numOpponentLivesLeft,
        });
    }
});

secureApiRouter.post('/game/storeStatus', async (req, res) => {
    console.log("Storing Current Game Status");
    console.log("GameID:", req.body.gameID);
    let gameState = await DB.getGame(req.body.gameID);
    const hostname = gameState.hostname;
    const opponentName = gameState.opponentName;
    const username = req.body.hostname;
    console.log('Username:', username);
    console.log('Hostname:', hostname);
    console.log('Opponent name:', opponentName);

    console.log("ALLLLLLEEEEERRRRRTTTT", gameState);
    console.log(req.body);
    if(username === hostname) {
        await DB.storeGameStatus(req.body.gameID, req.body, username);
        res.status(204).send({ msg: "Game Status Updated in DB" });
    } else if(username === opponentName) {
        const gameStatus = {
            hostname: opponentName,
            gameID: req.body.gameID,
            hostBoard: req.body.opponentBoard,
            opponentBoard: req.body.hostBoard,
            turn: req.body.turn,
            numShipsToPlaceHost: req.body.numShipsToPlaceOpponent,
            numShipsToPlaceOpponent: req.body.numShipsToPlaceHost,
            numHostLivesLeft: req.body.numOpponentLivesLeft,
            numOpponentLivesLeft: req.body.numHostLivesLeft,
        };
        await DB.storeGameStatus(req.body.gameID, gameStatus, opponentName);
    } else {
        res.status(401).send({ msg: 'You are not a player in this game' });
    }
});

secureApiRouter.post('/game/getStatus', async (req, res) => {
    console.log("Getting game status");
    const gameState = await DB.getGame(req.body.gameID);
    if (gameState) {
        console.log('Getting Status with GameID:', req.body.gameID);
        console.log('Hostname', gameState.hostname);
        console.log('Username:', req.body.username);
        const hostname = gameState.hostname;
        const opponentName = gameState.opponentName;
        const username = req.body.username;
        
        if(hostname === username) {
            res.send({ 
                opponentName: gameState.opponentName,
                hostBoard: gameState.hostBoard,
                opponentBoard: gameState.opponentBoard,
                turn: gameState.turn,
                numShipsToPlaceHost: gameState.numShipsToPlaceHost,
                numShipsToPlaceOpponent: gameState.numShipsToPlaceOpponent,
                numHostLivesLeft: gameState.numHostLivesLeft,
                numOpponentLivesLeft: gameState.numOpponentLivesLeft,
            });
        } else if (opponentName === username) {
            res.send({
                opponentName: gameState.hostname,
                hostBoard: gameState.opponentBoard,
                opponentBoard: gameState.hostBoard,
                turn: gameState.turn,
                numShipsToPlaceHost: gameState.numShipsToPlaceOpponent,
                numShipsToPlaceOpponent: gameState.numShipsToPlaceHost,
                numHostLivesLeft: gameState.numOpponentLivesLeft,
                numOpponentLivesLeft: gameState.numHostLivesLeft,
            });
        } else {
            res.status(401).send({ msg: 'You are not a player in this GameID' });
        }
    } else {
        res.status(401).send({ msg: 'Game Does Not Exist' });
    }
});

secureApiRouter.post('/records/insert', async (req, res) => {
    console.log("Inserting record");
    console.log("Username:", req.body.username);
    console.log("Opponent Name:", req.body.opponentName);
    console.log("Winner:", req.body.winner);

    const record = await DB.insertRecord(req.body.username, req.body.opponentName, req.body.winner);

    if (record){
        res.send({ id: record.id });
    } else {
        res.status(401).send({ msg: 'Cannot insert record' });
    }
});

secureApiRouter.post('/records/get', async (req, res) => {
    console.log("Getting users records");
    const records = await DB.getUsersRecords(req.body.username);
    if (records) {
        res.send({ records: records, });
    } else {
        res.status(401).send({ msg: 'Could not retrieve record' });
    }
});

// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});