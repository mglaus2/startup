const playerNameEl = document.getElementById('username');
const numRowsAndCols = 10;
const finalizeBoardButton = document.getElementById('finalize-board-button');
const generateColorButton = document.getElementById('generate-colors-button');

const EstablishConnectionEvent = "establishingConnection";
const ConnectionEstablishedEvent = "connectionEstablished";
const ErrorHappenedEvent = "error";
const BoardFinalizedEvent = "boardFinalized";
const StartGameEvent = "startGame";
const MoveFinishedEvent = "moveFinished";
const GameEndEvent = "gameEnd";

let username;
let opponentName;
let playerBoard;
let opponentBoard;
let gameID;
let turn;
let numShipsToPlaceHost;
let numShipsToPlaceOpponent;
let numHostLivesLeft;
let numOpponentLivesLeft;

let socket;
let isHost;
let connectionMessage;
let message;
let firstTurn = true;
let connectionEstablished = false;
let opponentBoardFinished = false;

async function init() {
    setDisplay('createGame', 'block');
    setDisplay('playGame', 'none');
}

init();

finalizeBoardButton.disabled = true;

const openColorInput = document.getElementById('openColor');
const shipColorInput = document.getElementById('shipColor');
const hitColorInput = document.getElementById('hitColor');
const missColorInput = document.getElementById('missColor');

openColorInput.addEventListener('input', handleColorChange);
shipColorInput.addEventListener('input', handleColorChange);
hitColorInput.addEventListener('input', handleColorChange);
missColorInput.addEventListener('input', handleColorChange);

function createEmptyBoard() {
    return Array.from(Array(numRowsAndCols), () => new Array(numRowsAndCols).fill(0));
}

async function handleFormSubmission() {
    const gameIDEl = document.getElementById('gameID');
    const username = localStorage.getItem('username');
    console.log(username);

    if (!gameIDEl.value) {
        alert("Please enter a GameID");
        return;
    }

    gameID = gameIDEl.value;

    const data = {
        username: username,
        gameID: gameIDEl.value,
    };

    const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    }); 

    const returnData = await response.json();

    if(response.ok) {
        console.log("GOOD RESPONSE");
        isHost = returnData.isHost;
        storeGameStateLocal(returnData, gameIDEl.value);
        configureWebSocket();
    } else {
        console.log("ERROR RESPONSE");
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${returnData.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }
}

function storeGameStateLocal(returnData, gameID, opponentName) {
    const hostBoardString = JSON.stringify(returnData.hostBoard);
    const opponentBoardString = JSON.stringify(returnData.opponentBoard);

    localStorage.setItem('gameID', gameID);
    localStorage.setItem('opponentName', opponentName);
    localStorage.setItem('hostBoard', hostBoardString);
    localStorage.setItem('opponentBoard', opponentBoardString);
    localStorage.setItem('turn', returnData.turn);
    localStorage.setItem('numShipsToPlaceHost', returnData.numShipsToPlaceHost);
    localStorage.setItem('numShipsToPlaceOpponent', returnData.numShipsToPlaceOpponent);
    localStorage.setItem('numHostLivesLeft', returnData.numHostLivesLeft);
    localStorage.setItem('numOpponentLivesLeft', returnData.numOpponentLivesLeft);
}

function storeBoardsLocal() {
    const playerBoardString = JSON.stringify(playerBoard);
    const opponentBoardString = JSON.stringify(opponentBoard);

    localStorage.setItem('gameID', gameID);
    localStorage.setItem('opponentName', opponentName);
    localStorage.setItem('hostBoard', playerBoardString);
    localStorage.setItem('opponentBoard', opponentBoardString);
    localStorage.setItem('turn', turn);
    localStorage.setItem('numShipsToPlaceHost', numShipsToPlaceHost);
    localStorage.setItem('numShipsToPlaceOpponent', numShipsToPlaceOpponent);
    localStorage.setItem('numHostLivesLeft', numHostLivesLeft);
    localStorage.setItem('numOpponentLivesLeft', numOpponentLivesLeft);
}

async function saveGameState() {
    const gameState = {
        hostname: username,
        gameID: gameID,
        hostBoard: playerBoard,
        opponentBoard: opponentBoard,
        turn: turn,
        numShipsToPlaceHost: numShipsToPlaceHost,
        numShipsToPlaceOpponent: numShipsToPlaceOpponent,
        numHostLivesLeft: numHostLivesLeft,
        numOpponentLivesLeft: numOpponentLivesLeft,
    };

    console.log(gameState);

    const response = await fetch('/api/game/storeStatus', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(gameState),
    });

    if(response.ok) {
        console.log("STORED IN DB");
        storeBoardsLocal();
    } else {
        console.log("STORING ERROR");
        const body = await response.json();
        message = displayMessage(`⚠ Error: ${body.msg}`);
    }
}

function retrieveBoardsLocal() {
    const playerBoardString = localStorage.getItem(`hostBoard`);
    const opponentBoardString = localStorage.getItem(`opponentBoard`);

    playerBoard = JSON.parse(playerBoardString);
    opponentBoard = JSON.parse(opponentBoardString);

    username = localStorage.getItem('username');
    opponentName = localStorage.getItem('opponentName');
    gameID = localStorage.getItem('gameID');
    turn = localStorage.getItem(`turn`);
    numShipsToPlaceHost = parseInt(localStorage.getItem('numShipsToPlaceHost'));
    numShipsToPlaceOpponent = parseInt(localStorage.getItem('numShipsToPlaceOpponent'));
    numHostLivesLeft = parseInt(localStorage.getItem(`numHostLivesLeft`));
    numOpponentLivesLeft = parseInt(localStorage.getItem(`numOpponentLivesLeft`));

    displayBoardLogic(true, true);
}

async function loadBoards() {
    username = localStorage.getItem('username');
    gameID = localStorage.getItem('gameID');

    setDisplay('createGame', 'none');
    setDisplay('playGame', 'block');

    const data = {
        gameID: gameID,
        username: username,
    };

    const response = await fetch('/api/game/getStatus', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const returnData = await response.json();
        opponentName = returnData.opponentName;
        playerBoard = returnData.hostBoard;
        opponentBoard = returnData.opponentBoard;
        turn = returnData.turn;
        numShipsToPlaceHost = returnData.numShipsToPlaceHost;
        numShipsToPlaceOpponent = returnData.numShipsToPlaceOpponent;
        numHostLivesLeft = returnData.numHostLivesLeft;
        numOpponentLivesLeft = returnData.numOpponentLivesLeft;

        let isTurn;
        if (isHost) {
            if (turn === "Host") {
                isTurn = true;
            } else {
                isTurn = false;
            }
        } else {
            if (turn === "Host") {
                // opponents turn
                isTurn = false;
            } else {
                isTurn = true;
            }
        }

        if (firstTurn) {
            console.log("Displaying board from DB");
            displayBoardLogic(isTurn, true);
        }
        console.log('Retrieved Boards from Server');

        // SAVE SCORES IF WE GO OFFLINE
        storeBoardsLocal();
    } else {
        const body = await response.json();
        message = displayMessage(`⚠ Error: ${body.msg}`);
    }
}

function displayBoardLogic(currTurn, fromServer) {
    console.log(turn);
    if (turn === 'Placing Ships') {
        playerNameEl.textContent = username + '\'s Board';
        displayBoard(playerBoard, 'board', handlePlayerCellClickPlacingShips);
    } else if (currTurn) {
        console.log("YOUR TURN");
        playerNameEl.textContent = opponentName + '\'s Board';
        //finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        if (numHostLivesLeft === 0 || numOpponentLivesLeft === 0) {
            console.log("GAME FINISHED");
            displayBoard(playerBoard, 'board');
            setTimeout(() => {
                message = displayMessage("You lost this game!");
            }, 1000);
        } else {
            console.log("Can Guess");
            if (!firstTurn && !fromServer) {
                message = displayMessage("It is your turn! Make a guess!");
            } else {
                firstTurn = false;
            }

            displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        }
    } else if(!currTurn) {
        console.log("OPPONENTS TURN");
        playerNameEl.textContent = username + '\'s Board';
        //finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        if(numHostLivesLeft === 0) {
            console.log("GAME OVER");
            displayBoard(playerBoard, 'board');
            setTimeout(() => {
                message = displayMessage("You lost this game!");
            }, 1000);
        } else if(numOpponentLivesLeft === 0) {
            console.log('YOU WON THIS GAME');
            displayBoard(opponentBoard, 'board');
            setTimeout(() => {
                message = displayMessage("You won this game!");
            }, 1000);
        } 
        else {
            console.log("Displaying own board");
            if (!firstTurn && !fromServer) {
                message = displayMessage("Opponents Turn. Wait for them to finish.");
            } else {
                firstTurn = false;
            }

            displayBoard(playerBoard, 'board');
        }
    }
}

function displayBoard(board, boardId, cellClickHandler) {
    const gameGrid = document.getElementById(boardId);
    gameGrid.innerHTML = '';

    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            const cell = document.createElement('div');
            cell.dataset.position = row * numRowsAndCols + col;

            if(cellClickHandler) {
                cell.addEventListener('click', cellClickHandler);
            }

            if(board === opponentBoard) {
                updateCellAppearanceOpponent(cell, board[row][col]);
            } else if(board === playerBoard) {
                updateCellAppearancePlayer(cell, board[row][col]);
            }

            gameGrid.appendChild(cell);
        }
    }
}

function handlePlayerCellClickPlacingShips(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;
    
    if(numShipsToPlaceHost > 0 || playerBoard[row][col] === 4) {
        if(playerBoard[row][col] === 0) {
            playerBoard[row][col] = 4;
        } else {
            playerBoard[row][col] = 0;
        }

        updatePlayerBoardCell(event.target);

        if (numShipsToPlaceHost === 0) {
            finalizeBoardButton.disabled = false;
        } else {
            finalizeBoardButton.disabled = true;
        }
    } else {
        message = displayMessage("Too many ships.");
    }
}

function updatePlayerBoardCell(cellElement) {
    if(cellElement.className === "open-cell") {
        cellElement.className = "ship-cell";
        --numShipsToPlaceHost;
    } else {
        cellElement.className = "open-cell";
        ++numShipsToPlaceHost;
    }
}

// need to include updating opponent with Web Socket
function handlePlayerCellClickGuess(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;

    if(opponentBoard[row][col] === 1 || opponentBoard[row][col] === 2 || opponentBoard[row][col] === 3) {
        message = displayMessage("Invalid Guess.");
    } else if (opponentBoard[row][col] === 4) {
        if (isHost) {
            turn = "Opponent";
        } else {
            turn = "Host";
        }
        opponentBoard[row][col] = 2;
        --numOpponentLivesLeft;
        let tempMatrix = createEmptyBoard();
        console.log("CHECKING IF SUNK");
        if(checkIfSunk(row, col, tempMatrix, true, opponentBoard)) {
            displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
            setTimeout(() => {
                if (numOpponentLivesLeft === 0) {
                    message = displayMessage("YOU WON!");
                    storeResults(username);
                    displayBoard(opponentBoard, 'board');
                    sendMoveFinishedEvent();
                } else {
                    saveGameState();
                    sendMoveFinishedEvent();
                }
            }, 1000);
        } else {
            updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);
            saveGameState();
            setTimeout(() => {
                sendMoveFinishedEvent();
            }, 1000);
        }
    } else {
        if (isHost) {
            turn = "Opponent";
        } else {
            turn = "Host";
        }
        opponentBoard[row][col] = 1;
        updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);

        saveGameState();

        setTimeout(() => {
            sendMoveFinishedEvent();
        }, 1000);
    }
}

function updateCellAppearanceOpponent(cellElement, cellValue) {
    if(cellValue === 0 || cellValue === 4) {
        cellElement.className = 'open-cell';
    } else if(cellValue === 1) {
        cellElement.className = 'miss-cell';
    } else if(cellValue === 2) {
        cellElement.className = 'hit-cell';
    } else if(cellValue === 3) {
        cellElement.className = 'ship-cell';
    }
}

function updateCellAppearancePlayer(cellElement, cellValue) {
    if(cellValue === 0) {
        cellElement.className = 'open-cell';
    } else if(cellValue === 1) {
        cellElement.className = 'miss-cell';
    } else if(cellValue === 2) {
        cellElement.className = 'hit-cell-with-ship';
    } else if(cellValue === 3) {
        cellElement.className = 'ship-cell';
    } else if(cellValue === 4) {
        cellElement.className = 'hidden-ship-cell';
    }
}

function validateShips() {
    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            if (playerBoard[row][col] === 4) {
                if (row - 1 >= 0 && playerBoard[row - 1][col] === 4) {
                    continue;
                }
                if (row + 1 < numRowsAndCols && playerBoard[row + 1][col] === 4) {
                    continue;
                }
                if (col - 1 >= 0 && playerBoard[row][col - 1] === 4) {
                    continue;
                }
                if (col + 1 < numRowsAndCols && playerBoard[row][col + 1] === 4) {
                    continue;
                }

                return false;
            }
        }
    }

    return true;
}

finalizeBoardButton.addEventListener('click', () => {
    if (validateShips()) {
        if (opponentBoardFinished) {
            displayStartGameMessage();
        } else {
            message = displayMessage("Board finalized! Waiting for opponent to finalize board.");
            turn = "Placing Ships";
            displayBoard(playerBoard, 'board');
        }

        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        saveGameState();
        boardFinalized();
    } else {
        message = displayMessage("Invalid ships");
    }
});

function displayStartGameMessage() {
    turn = "Host";
    if (isHost) {
        message = displayMessage("Board Finalized! It is your turn! Make a guess!");
        displayBoardLogic(true, true);
    } else {
        message = displayMessage("Board Finalized! Opponents Turn. Wait for them to finish.");
        displayBoardLogic(false, true);
    }
}

function checkIfSunk(row, col, tempMatrix, firstIteration, board) {
    console.log(`Checking cell (${row}, ${col})`);
    if (row < 0 || row >= numRowsAndCols || col < 0 || col >= numRowsAndCols || tempMatrix[row][col] === 3 || tempMatrix[row][col] === 1) {
        return true;
    }

    if(!firstIteration) {
        if (board[row][col] !== 4) {
            if(board[row][col] === 2) {
                tempMatrix[row][col] = 3;
                const isSunk =
                    checkIfSunk(row - 1, col, tempMatrix, false, board) &&
                    checkIfSunk(row + 1, col, tempMatrix, false, board) &&
                    checkIfSunk(row, col - 1, tempMatrix, false, board) &&
                    checkIfSunk(row, col + 1, tempMatrix, false, board);
                return isSunk;
            } else {
                tempMatrix[row][col] = 1;
            }
            return true;
        } else {
            return false;
        }
    } else {
        tempMatrix[row][col] = 3;
    }
    
    const isSunk =
        checkIfSunk(row - 1, col, tempMatrix, false, board) &&
        checkIfSunk(row + 1, col, tempMatrix, false, board) &&
        checkIfSunk(row, col - 1, tempMatrix, false, board) &&
        checkIfSunk(row, col + 1, tempMatrix, false, board);

    if(isSunk) {
        console.log(tempMatrix);
        for (let row = 0; row < numRowsAndCols; row++) {
            for (let col = 0; col < numRowsAndCols; col++) {
                if (tempMatrix[row][col] === 3) {
                    board[row][col] = 3;
                }
            }
        }
    }
    return isSunk;
}

// will get opponents guess through web socket instead of simulation
function simulateOpponentGuess() {
    console.log("SIMULATING OPPONENT");
    playerNameEl.textContent = username + '\'s Board';
    displayBoard(playerBoard, 'board');
    const row = Math.floor(Math.random() * numRowsAndCols);
    const col = Math.floor(Math.random() * numRowsAndCols);

    // Check if the cell has already been guessed by the opponent
    if (playerBoard[row][col] === 0) {
        playerBoard[row][col] = 1;
        const cellId = row * numRowsAndCols + col;
        const cellElement = document.querySelector(`#board [data-position="${cellId}"]`);
        updateCellAppearancePlayer(cellElement, 1);
    } else if(playerBoard[row][col] === 4) {
        playerBoard[row][col] = 2;
        --numHostLivesLeft;
        let tempMatrix = createEmptyBoard();
        if(checkIfSunk(row, col, tempMatrix, true, playerBoard)) {
            displayBoard(playerBoard, 'board');
            setTimeout(() => {
                if (numHostLivesLeft === 0) {
                    message = displayMessage("You lost.");
                    ///storeResults(opponentName);  // only should call this once for the winner when fully implemented
                    displayBoard(playerBoard, 'board');
                    sendMoveFinishedEvent();
                }
            }, 1000);
        } else {
            const cellId = row * numRowsAndCols + col;
            const cellElement = document.querySelector(`#board [data-position="${cellId}"]`);
            updateCellAppearancePlayer(cellElement, 2);
        }
    } 
    else {
        // Cell has already been guessed, try again
        simulateOpponentGuess();
    }

    setTimeout(() => {
        playerNameEl.textContent = opponentName + '\'s Board';
        displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
    }, 5000);

    turn = "Host";
    saveGameState();
}

function handleColorChange() {
    const openColor = openColorInput.value;
    const shipColor = shipColorInput.value;
    const hitColor = hitColorInput.value;
    const missColor = missColorInput.value;

    document.documentElement.style.setProperty('--open-cell-color', openColor);
    document.documentElement.style.setProperty('--ship-cell-color', shipColor);
    document.documentElement.style.setProperty('--hit-cell-color', hitColor);
    document.documentElement.style.setProperty('--miss-cell-color', missColor);
}

async function storeResults(winner) {
    console.log('Storing Results');
    const data = {
        username: username,
        opponentName: opponentName,
        winner: winner,
    };

    const response = await fetch('/api/records/insert', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (response.ok) {
        storeResultsLocal(winner);
        saveGameState();
    } else {
        const body = await response.json();
        message = displayMessage(`⚠ Error: ${body.msg}`);
    }
}

// store in database rather than local storage
function storeResultsLocal(winner) {
    let records = [];
    console.log("Storing record local");
    const recordsText = localStorage.getItem('gameRecords');
    if(recordsText) {
        records = JSON.parse(recordsText);
    }
    
    // check if there is an existing record based on username and opponentName
    const existingRecord = records.find(record => record.username === username && record.opponent === opponentName);
    console.log("Existing record:", existingRecord);

    if (existingRecord) {
        console.log("Updating record local");
        if (username === winner) {
            existingRecord.wins++;
        } else if (opponentName === winner) {
            existingRecord.losses++;
        }
    } else {
        console.log("Creating record local");
        records.push({
            username: username,
            opponent: opponentName,
            wins: winner === username ? 1 : 0,
            losses: winner === opponentName ? 1 : 0
        });
    }

    localStorage.setItem('gameRecords', JSON.stringify(records));
}

async function generateColors() {
    const openColor = openColorInput.value;
    const hexValues = openColor.match(/[0-9a-fA-F]{2}/g);
    const r = parseInt(hexValues[0], 16);
    const g = parseInt(hexValues[1], 16);
    const b = parseInt(hexValues[2], 16);
    
    const colorAPIUrl = 'https://www.thecolorapi.com/scheme';

    const params = {
        hex: openColor,
        mode: 'analogic-complement',
        count: 4,
    };

    const queryString = Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&');

    const apiUrlWithParams = `${colorAPIUrl}?${queryString}`;

    fetch(apiUrlWithParams)
        .then(response => response.json())
        .then(data => setColors(data))
        .catch(error => console.error('Error:', error));
}

function setColors(data) {
    console.log(data);
    console.log(data.colors[1].hex.value)

    const shipColor = data.colors[1].hex.value;
    const hitColor = data.colors[2].hex.value;
    const missColor = data.colors[3].hex.value;


    document.documentElement.style.setProperty('--ship-cell-color', shipColor);
    shipColorInput.value = shipColor;

    document.documentElement.style.setProperty('--hit-cell-color', hitColor);
    hitColorInput.value = hitColor;

    document.documentElement.style.setProperty('--miss-cell-color', missColor);
    missColorInput.value = missColor;
}

generateColorButton.addEventListener('click', () => {
    console.log('PRESSED GENERATE COLOR');
    generateColors();
});

function displayMessage(newMessage) {
    if (message) {
        message.hide();
        
        setTimeout(() => {
            const modalEl = document.querySelector('#msgModal');
            modalEl.querySelector('.modal-body').textContent = `${newMessage}`;
            const msgModal = new bootstrap.Modal(modalEl, {});
            msgModal.show();

            return msgModal;
        }, 1000);
    } else {
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `${newMessage}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();

        return msgModal;
    }
}

function displayConnectionMessage(message) {
    const modalEl = document.querySelector('#msgModalConnection');
    modalEl.querySelector('.modal-body').textContent = `${message}`;
    const msgModal = new bootstrap.Modal(modalEl, {});
    msgModal.show();

    return msgModal;
}

function configureWebSocket() {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    socket = new WebSocket(`${protocol}://${window.location.host}/${gameID}`);

    socket.onopen = (event) => {
        console.log("Connected to WebSocket");
        //displayMessage("Connected to WebSocket");
    }

    socket.onmessage = async (event) => {
        console.log("Recieved message from websocket");
        const msg = JSON.parse(await event.data);
        console.log(msg.message);
        if (msg.type === EstablishConnectionEvent || msg.type === ErrorHappenedEvent) {
            connectionMessage = displayConnectionMessage(msg.content);
        } else if (msg.type === ConnectionEstablishedEvent) {
            console.log("2 players connected");
            connectionEstablished = true;
            if (connectionMessage) {
                connectionMessage.hide();
            }
            await loadBoards();
            //message = displayMessage(msg.content);
        } else if (msg.type === BoardFinalizedEvent) {
            opponentBoardFinished = true;

            setTimeout(async () => {
                await loadBoards();
                console.log("After loading boards", opponentBoard);
            }, 2000);
        } else if (msg.type === StartGameEvent) {
            // implement where to start game
            if(message) {
                message.hide();
            }

            setTimeout(async () => {
                await loadBoards();
                console.log("After loading boards", opponentBoard);
            }, 2000);

            if (isHost) {
                // your turn and send response everytime it says simulate opponent guess
                message = displayMessage("It is your turn! Make a guess!");
                displayBoardLogic(true, false);
            } else {
                // wait for your turn by waiting for message and not letting user touch board
                message = displayMessage("Opponents Turn. Wait for them to finish.");
                displayBoardLogic(false, false);
            }
        } else if (msg.type === MoveFinishedEvent) {
            setTimeout(async () => {
                await loadBoards();
                console.log("After loading boards", opponentBoard);
                displayBoard(playerBoard, 'board');

                setTimeout(() => {
                    displayBoard(playerBoard, 'board');
                    displayBoardLogic(true, false);
                }, 2500); 
            }, 2000);
        }
    }
}

function boardFinalized() {
    let event;

    if (opponentBoardFinished) {
        console.log("Sending game start event");
        event = {
            type: StartGameEvent,
        };
    } else {
        console.log("Sending board finished event");
        event = {
            type: BoardFinalizedEvent,
        };
    }

    socket.send(JSON.stringify(event));
}

function sendMoveFinishedEvent() {
    const event = {
        type: MoveFinishedEvent,
    };

    socket.send(JSON.stringify(event));
    if (numHostLivesLeft !== 0 && numOpponentLivesLeft !== 0) {
        displayBoardLogic(false, false);
    }
}

function setDisplay(controlId, display) {
    console.log(controlId);
    const playControlEl = document.getElementById(`${controlId}`);
    console.log('IN SET DISPLAY');
    console.log(playControlEl);
    if (playControlEl) {
        console.log('Setting element display');
        playControlEl.style.display = display;
    }
}

function closeConnection() {
    console.log("Close connection");
    socket.close();
}