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
    console.log('GAME IS CALLED');
    const data = {
        playerBoard: playerBoard,
        opponentBoard: opponentBoard,
        canGuess: canGuess,
        numShipsToPlace: numShipsToPlace,
        numHitsLeft: numHitsLeft,
        numLivesLeft: numLivesLeft,
    };

    console.log(data);
    res.send(data);
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