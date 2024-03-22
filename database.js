const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const gameCollection = db.collection('game');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
    await client.connect();
    await db.command({ ping: 1 });
})().catch((ex) => {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
});

function getUser(username) {
    return userCollection.findOne({ username: username });
}

function getUserByToken(token) {
    return userCollection.findOne({ token: token });
}

async function createUser(username, password) {
    // Hash the password before we insert it into the database
    const passwordHash = await bcrypt.hash(password, 10);
  
    const user = {
      username: username,
      password: passwordHash,
      token: uuid.v4(),
    };
    await userCollection.insertOne(user);
  
    return user;
}

async function getGame(gameID) {
    return gameCollection.findOne({ gameID: gameID });
}

async function createGame(username, gameID) {
    let hostBoard = Array.from(Array(10), () => new Array(10).fill(0));
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
    let turn = "Placing Ships";
    let numShipsToPlaceHost = 10;
    let numShipsToPlaceOpponent = 0;
    let numHostLivesLeft = 10;
    let numOpponentLivesLeft = 10;
    let opponentName = 'Computer';

    const gameState = {
        gameID: gameID,
        hostname: username,
        opponentName: opponentName,
        hostBoard: hostBoard,
        opponentBoard: opponentBoard,
        turn: turn,
        numShipsToPlaceHost: numShipsToPlaceHost,
        numShipsToPlaceOpponent: numShipsToPlaceOpponent,
        numHostLivesLeft: numHostLivesLeft,
        numOpponentLivesLeft: numOpponentLivesLeft,
    };

    await gameCollection.insertOne(gameState);

    return gameState;
}

async function storeGameStatus(gameID, currGameState, username) {
    console.log("Storing Game Status in DB");
    console.log("GameID:", gameID);

    const filter = { gameID : gameID };
    let gameState;
    const hostname = currGameState.hostname;
    const opponentName = currGameState.opponentName;

    if (username === hostname) {
        console.log('Username matched with hostname');
        gameState = {
            hostBoard: currGameState.hostBoard,
            opponentBoard: currGameState.opponentBoard,
            turn: currGameState.turn,
            numShipsToPlaceHost: currGameState.numShipsToPlaceHost,
            numShipsToPlaceOpponent: currGameState.numShipsToPlaceOpponent,
            numHostLivesLeft: currGameState.numHostLivesLeft,
            numOpponentLivesLeft: currGameState.numOpponentLivesLeft,
        };
    } else if (username === opponentName) {
        console.log('Username matched with opponentName');
        gameState = {
            hostBoard: currGameState.opponentBoard,
            opponentBoard: currGameState.playerBoard,
            turn: currGameState.turn,
            numShipsToPlaceHost: currGameState.numShipsToPlaceOpponent,
            numShipsToPlaceOpponent: currGameState.numShipsToPlaceHost,
            numHostLivesLeft: currGameState.numOpponentLivesLeft,
            numOpponentLivesLeft: currGameState.numHostLivesLeft,
        };
    }

    console.log("Game State:", gameState);

    await gameCollection.updateOne(filter, { $set: gameState });

    return gameState;
}

module.exports = {
    getUser,
    getUserByToken,
    createUser,
    getGame,
    createGame,
    storeGameStatus,
};