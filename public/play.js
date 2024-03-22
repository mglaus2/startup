const playerNameEl = document.getElementById('username');

let numShipsToPlace = 10; // Soon to replace with numShipsToPlaceHost and Opponent
let numHitsLeft = 10; // SOON TO REPLACE WITH numOpponentLivesLeft
let numLivesLeft = 10; // SOON TO REPLACE WITH numHostLivesLeft
let canGuess; // SOON TO REPLACE WITH TURN STRING

const numRowsAndCols = 10;
const finalizeBoardButton = document.getElementById('finalize-board-button');
const generateColorButton = document.getElementById('generate-colors-button');

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

async function init() {
    retrieveBoardsLocal();
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

// currently stores boards in local storage with gameID, will store in database based off of gameID
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
        const returnData = await response.json();
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${returnData.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }

    try {
        const response = await fetch('/api/game/storeStatus', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(gameState),
        });

        const data = await response.json();
        const message = data.message;
        if(message === 'Game Status saved successfully') {
            console.log('Saved boards in server');
        }
        storeBoardsLocal();
    } catch {
        storeBoardsLocal();
    }
}

// will pull from database instead of local storage
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

    displayBoardLogic();
}

// will pull from database instead of local storage
/*function retrieveBoardsLocal() {
    const playerBoardString = localStorage.getItem(`playerBoard_${gameID}`);
    const opponentBoardString = localStorage.getItem(`opponentBoard_${gameID}`);

    if (playerBoardString && opponentBoardString) {
        console.log("GETTING BOARDS LOCAL");
        playerBoard = JSON.parse(playerBoardString);
        opponentBoard = JSON.parse(opponentBoardString);
        canGuess = localStorage.getItem(`canGuess_${gameID}`);
        numLivesLeft = parseInt(localStorage.getItem(`numLivesLeft_${gameID}`));
        numHitsLeft = parseInt(localStorage.getItem(`numHitsLeft_${gameID}`));

        displayBoardLogic();
    } else {
        // 0 is open cell, 1 is miss, 2 is hit, 3 is sunk ship, and 4 is ship is there but not interacted with
        // WOULD GET OPPONENTS BOARD THROUGH WEB SOCKETS BUT NOW CREATED WITH DUMMY DATA
        playerBoard = createEmptyBoard();
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
    }
}*/

function displayBoardLogic() {
    if (turn === 'Placing Ships') {
        playerNameEl.textContent = username + '\'s Board';
        displayBoard(playerBoard, 'board', handlePlayerCellClickPlacingShips);
    } else if (turn === 'Host') {
        playerNameEl.textContent = opponentName + '\'s Board';
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        if (numHostLivesLeft === 0 || numOpponentLivesLeft=== 0) {
            displayBoard(opponentBoard, 'board');
        } else {
            displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        }
    } else if(turn === 'Opponent') {
        playerNameEl.textContent = username + '\'s Board';
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        if(numHostLivesLeft === 0) {
            console.log("GAME OVER");
            displayBoard(playerBoard, 'board');
            setTimeout(() => {
                alert("You lost this game!");
            }, 1000);
        } else if(numOpponentLivesLeft === 0) {
            console.log('YOU WON THIS GAME');
            displayBoard(opponentBoard, 'board');
            setTimeout(() => {
                alert("You won this game!");
            }, 1000);
        } 
        else {
            setTimeout(() => {
                simulateOpponentGuess();
            }, 1000);
        }
    }


    /*if(canGuess) {
        console.log("CAN GUESS");
        console.log(numLivesLeft);
        console.log(numHitsLeft);
        playerNameEl.textContent = opponentName + '\'s Board';
        if(numLivesLeft === 0 || numHitsLeft === 0) {
            console.log("GAME OVER");
            finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
            displayBoard(opponentBoard, 'board');
        } else if(numShipsToPlace === 10) {
            playerNameEl.textContent = username + '\'s Board';
            displayBoard(playerBoard, 'board', handlePlayerCellClickPlacingShips);
        }
        else {
            finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
            displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        }
    } else {
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        if(numLivesLeft === 0) {
            console.log("GAME OVER");
            displayBoard(playerBoard, 'board');
            setTimeout(() => {
                alert("You lost this game!");
            }, 1000);
        } else if(numHitsLeft === 0) {
            console.log('YOU WON THIS GAME');
            displayBoard(opponentBoard, 'board');
            setTimeout(() => {
                alert("You won this game!");
            }, 1000);
        } 
        else {
            setTimeout(() => {
                simulateOpponentGuess();
            }, 1000);
        }
    }*/
}
// Do not use since loaded in game-hub and use local data
async function loadBoards() {
    playerBoard = []
    opponentBoard = []
    canGuess = true;
    numShipsToPlace = 0;
    numHitsLeft = 0;
    numLivesLeft = 0;

    const data = {
        gameID: gameID,
        username: username,
        opponentName: opponentName,
    };

    try {
        const response = await fetch('/api/gameStatus', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        });
        const returnData = await response.json();
        playerBoard = returnData.playerBoard;
        opponentBoard = returnData.opponentBoard;
        canGuess = returnData.canGuess;
        numShipsToPlace = returnData.numShipsToPlace;
        numHitsLeft = returnData.numHitsLeft;
        numLivesLeft = returnData.numLivesLeft;
        gameID = returnData.gameID;
        username = returnData.username;
        opponentName = returnData.opponentName;

        displayBoardLogic();
        console.log('Retrieved Boards from Server');

        // SAVE SCORES IF WE GO OFFLINE
        storeBoardsLocal();
    } catch (error) {
        console.error('Error during fetch:', error);
        retrieveBoardsLocal();
    }
}

async function getGameInfo() {
    try {
        const response = await fetch('/api/getGameInfo');
        const returnData = await response.json();

        console.log(returnData);

        username = returnData.username;
        opponentName = returnData.opponentName;
        gameID = returnData.gameID;

        console.log('Got Game Info from Server');
        
        storeGameInfoLocal();
    } catch {
        getGameInfoLocal();
    }
}

function getGameInfoLocal() {
    username = localStorage.getItem('username') ?? 'Mystery Player';
    opponentName = localStorage.getItem('opponentName') ?? 'Mystery Player';
    gameID = localStorage.getItem('gameID') ?? 'Test GameID';
}

function storeGameInfoLocal() {
    localStorage.setItem("username", username);
    localStorage.setItem("opponentName", opponentName);
    localStorage.setItem("gameID", gameID);
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
        alert("Too many ships.");
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

// need to include updating opponent with Web Socket TO DOOOOOOO ********
function handlePlayerCellClickGuess(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;

    if (turn === "Host") {
        if(opponentBoard[row][col] === 1 || opponentBoard[row][col] === 2 || opponentBoard[row][col] === 3) {
            alert("Invalid Guess.");
        } else if (opponentBoard[row][col] === 4) {
            turn = "Opponent";
            opponentBoard[row][col] = 2;
            --numOpponentLivesLeft;
            let tempMatrix = createEmptyBoard();
            console.log("CHECKING IF SUNK");
            if(checkIfSunk(row, col, tempMatrix, true, opponentBoard)) {
                displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
                setTimeout(() => {
                    if (numOpponentLivesLeft === 0) {
                        alert("YOU WON!");
                        storeResults(true);
                        saveGameState();
                        displayBoard(opponentBoard, 'board');
                    } else {
                        simulateOpponentGuess();
                    }
                }, 1000);
            }
        } else {
            turn = "Opponent";
            opponentBoard[row][col] = 1;
            updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);

            saveGameState();

            setTimeout(() => {
                simulateOpponentGuess();
            }, 1000);
        }
    }


    
    /*if(canGuess) {
        if(opponentBoard[row][col] === 1 || opponentBoard[row][col] === 2 || opponentBoard[row][col] === 3) {
            alert("Invalid Guess.");
        } else if(opponentBoard[row][col] === 4) {
            canGuess = false;
            opponentBoard[row][col] = 2;
            --numHitsLeft;
            let tempMatrix = createEmptyBoard();
            console.log("CHECKING IF SUNK");
            if(checkIfSunk(row, col, tempMatrix, true, opponentBoard)) {
                displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
                setTimeout(() => {
                    if (numHitsLeft === 0) {
                        alert("YOU WON!");
                        storeResults(true);
                        saveGameState();
                        displayBoard(opponentBoard, 'board');
                    } else {
                        simulateOpponentGuess();
                    }
                }, 1000);
            } else {
                updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);
                saveGameState();
                setTimeout(() => {
                    simulateOpponentGuess();
                }, 1000);
            }
        } else {
            canGuess = false;
            opponentBoard[row][col] = 1;
            updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);

            saveGameState();

            setTimeout(() => {
                simulateOpponentGuess();
            }, 1000);
        }

    }*/
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
        alert("Board Finalized!");
        playerNameEl.textContent = opponentName + '\'s Board';
        displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        turn = "Host";
        saveGameState();
    } else {
        alert("Invalid ships");
    }
});

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
                if (numHitsLeft === 0) {
                    alert("You lost.");
                    storeResults(false);
                    displayBoard(playerBoard, 'board');
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

async function storeResults(didWin) {
    console.log('Storing Results');
    const data = {
        username: username,
        opponentName: opponentName,
        didWin: didWin,
    };

    try {
        const response = await fetch('/api/updateRecord', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        const message = responseData.message;
        if(message === 'Users records updated successfully') {
            console.log('Users records updated in server');
        }
        storeResultsLocal(didWin);
    } catch {
        storeResultsLocal(didWin);
    }
}

// store in database rather than local storage
function storeResultsLocal(didWin) {
    let records = [];
    const recordsText = localStorage.getItem('gameRecords');
    if(recordsText) {
        records = JSON.parse(recordsText);
    }
    
    // check if there is an existing record based on username and opponentName
    const existingRecord = records.find(record => record.username === username && record.opponent === opponentName);

    if (existingRecord) {
        if (didWin === true) {
            existingRecord.wins++;
        } else if (didWin === false) {
            existingRecord.losses++;
        }
    } else {
        records.push({
            username: username,
            opponent: opponentName,
            wins: didWin === true ? 1 : 0,
            losses: didWin === false ? 1 : 0
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