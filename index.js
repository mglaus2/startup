const express = require('express');
const app = express();

// The service port. In production the frontend code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
const apiRouter = express.Router();
app.use('/api', apiRouter);

// PUT GET AND POST FUNCTIONS
apiRouter.get('/gameStatus', (_req, res) => {
    console.log('Getting Game Status');
    const data = {
        playerBoard: playerBoard,
        opponentBoard: opponentBoard,
        canGuess: canGuess,
        numShipsToPlace: numShipsToPlace,
        numHitsLeft: numHitsLeft,
        numLivesLeft: numLivesLeft,
        gameID: gameID,
    };

    console.log(data);
    res.send(data);
});

apiRouter.post('/updateGameStatus', (req, res) => {
    console.log('Saving Game Status');
    updateGameStatus(req.body);

    const data = {
        playerBoard: playerBoard,
        opponentBoard: opponentBoard,
        canGuess: canGuess,
        numShipsToPlace: numShipsToPlace,
        numHitsLeft: numHitsLeft,
        numLivesLeft: numLivesLeft,
        gameID: gameID,
    };

    console.log(data);

    res.send(data);
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

// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Boards and game state information
let numRowsAndCols = 10;
let playerBoard = Array.from(Array(numRowsAndCols), () => new Array(numRowsAndCols).fill(0));
let opponentBoard = [
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
let canGuess = true;
let numShipsToPlace = 10;
let numHitsLeft = 10;
let numLivesLeft = 10;

let gameID = 'TEST INPUT';
let username = 'TEST INPUT'
let opponentName = 'TEST INPUT';

function updateGameStatus(gameState) {
    playerBoard = gameState.playerBoard;
    opponentBoard = gameState.opponentBoard;
    canGuess = gameState.canGuess;
    numShipsToPlace = gameState.numShipsToPlace;
    numHitsLeft = gameState.numHitsLeft;
    numLivesLeft = gameState.numLivesLeft;
    gameID = gameState.gameID;
}