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
secureApiRouter.post('/joinGame', async (req, res) => {
    let gameState = await DB.getGame(req.body.gameID);
    if (gameState) {
        console.log('Joining Game with GameID:', req.body.gameID);
        console.log('Hostname', gameState.hostname);
        console.log('Username:', req.body.username);
        const hostname = gameState.hostname;
        const username = req.body.username;
        // add to check for opponent after websocket since we will only be storing 1 version of the game?
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
        } else {
            res.status(401).send({ msg: 'You are not host to this GameID' });
        }
    } else if (req.body.gameID === null) {
        res.status(401).send({ msg: 'Invalid GameID' });
    } else {
        console.log('Creating Game with GameID:', req.body.gameID);
        gameState = await DB.createGame(req.body.username, req.body.gameID);
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
    }
});

apiRouter.post('/gameStatus', (req, res) => {
    console.log('Getting Game Status');
    checkGameStatus(req.body);

    const data = {
        playerBoard: playerBoard,
        opponentBoard: opponentBoard,
        canGuess: canGuess,
        numShipsToPlace: numShipsToPlace,
        numHitsLeft: numHitsLeft,
        numLivesLeft: numLivesLeft,
        gameID: gameID,
        username: username,
        opponentName: opponentName,
    };

    console.log(data);
    res.send(data);
});

apiRouter.post('/updateGameStatus', (req, res) => {
    console.log('Saving Game Status');
    updateGameStatus(req.body);

    res.json({ message: 'Game Status saved successfully'});
});

apiRouter.post('/saveUsername', (req, res) => {
    console.log('Saving Username');
    username = req.body.username;

    console.log(username);

    res.json({ message: 'Username saved successfully'});
});

apiRouter.post('/saveGameID', (req, res) => {
    console.log('Saving Game ID');
    gameID = req.body.gameID;
    opponentName = req.body.opponentName;

    console.log(gameID);
    console.log(opponentName);

    res.json({ message: 'Game ID saved successfully' });
});

apiRouter.get('/getGameInfo', (_req, res) => {
    console.log('Getting Game Info');

    data = {
        username: username,
        opponentName: opponentName,
        gameID: gameID,
    };

    console.log(data);

    res.send(data);
});

apiRouter.post('/getUsersRecords', (req, res) => {
    console.log('Getting users records');
    userRecords = getUsersRecords(req.body, records);

    data = {
        userRecords: userRecords,
    };

    console.log(data);

    res.send(data);
});

apiRouter.get('/getUsername', (_req, res) => {
    console.log('Getting Username');
    username = getUsername();

    data = {
        username: username,
    };

    console.log(data);

    res.send(data);
});

apiRouter.post('/updateRecord', (req, res) => {
    console.log('Updating Record');
    updateRecord(req.body, records);

    console.log(records);

    res.json({ message: 'Users records updated successfully' });
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

// Boards and game state information
let numRowsAndCols = 10;
let playerBoard = null;
let opponentBoard = null;
let canGuess = null;
let numShipsToPlace = null;
let numHitsLeft = null;
let numLivesLeft = null;
let username = null;
let opponentName = null;
let gameID = null;
let currGameID = null;
let currUsername = null;
let records = [];

function updateGameStatus(gameState) {
    playerBoard = gameState.playerBoard;
    opponentBoard = gameState.opponentBoard;
    canGuess = gameState.canGuess;
    numShipsToPlace = gameState.numShipsToPlace;
    numHitsLeft = gameState.numHitsLeft;
    numLivesLeft = gameState.numLivesLeft;
    gameID = gameState.gameID;
}

function checkGameStatus(gameState) {
    console.log(gameState.gameID);
    console.log(gameState.username);
    console.log(gameState.opponentName);
    // this is going to check if the game is in the database 
    // if it is in the database then loads the current state 
    // if it is not in the database it creates an new entry

    // currently since the username is being updated there is
    // no way to simulate looking for it up in the database and
    // it only stores one game at a time. Implementing this
    // is more complex than just storing each game in the database
    if(gameState.gameID !== currGameID || gameState.username !== currUsername || gameState.opponentName !== opponentName
        || gameState.gameID === null || gameState.username === null || gameState.opponentName === null) {
        playerBoard = Array.from(Array(numRowsAndCols), () => new Array(numRowsAndCols).fill(0));
        opponentBoard = [
            [0, 4, 4, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
            [0, 0, 4, 4, 4, 0, 0, 0, 0, 0],
            [0, 0, 0, 4, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        canGuess = true;
        numShipsToPlace = 10;
        numHitsLeft = 10;
        numLivesLeft = 10;

        if(gameState.gameID === null) {
            console.log('updating gameID');
            gameID = 'TEST INPUT'
        }
        if (gameState.username === null) {
            username = 'Mystery Player'
        }
        if(gameState.opponentName === null) {
            opponentName = 'Opponent';
        }
        currGameID = gameID;
        currUsername = username;
    } else{
        console.log('Getting stored boards');
    }
}

function getUsername() {
    if (username === null) {
        console.log('SETTING USERNAME IN GET USERNAME');
        username = 'Mystery Player';
    }

    return username;
}

function getUsersRecords(gameInfo, records) {
    let userRecords = [];

    if (username === null) {
        console.log('SETTING USERNAME IN GET RECORDS');
        username = 'Mystery Player';
    }

    if (records.length) {
        for (const [i, record] of records.entries()) {
            if (record.username === gameInfo.username) {
                userRecords.push(record);
            }
        }
    }

    return userRecords;
}

function updateRecord(gameResults, records) {
    let gameRecord = null;
    console.log(gameResults.username);
    console.log(gameResults.opponentName);
    console.log(gameResults.didWin);

    if (records.length) {
        for (const record of records) {
            console.log('RECORD:');
            console.log(record);
            if (record.username === gameResults.username && record.opponentName === gameResults.opponentName) {
                console.log('FOUND GAME RECORD');
                gameRecord = record;
            }
        }
    }

    if (gameRecord === null) {
        console.log('Creating new record');
        records.push({
            username: gameResults.username,
            opponentName: gameResults.opponentName,
            wins: gameResults.didWin === true ? 1 : 0,
            losses: gameResults.didWin === false ? 1 : 0,
        });
    } else {
        console.log('Updating record');
        if (gameResults.didWin === true) {
            gameRecord.wins += 1;
        } else {
            gameRecord.losses += 1;
        }
    }
}