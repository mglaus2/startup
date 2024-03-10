const playerNameEl = document.getElementById('username');
const username = localStorage.getItem('username') ?? 'Mystery Player';
const opponentName = localStorage.getItem('opponentName') ?? 'Mystery Player';
const gameID = localStorage.getItem('gameID') ?? 'No Game ID';

const numRowsAndCols = 10;
let numShipsToPlace = 10;
let numHitsLeft = 10;
let numLivesLeft = 10;
let canGuess;
let playerBoard;
let opponentBoard;
const finalizeBoardButton = document.getElementById('finalize-board-button');
const generateColorButton = document.getElementById('generate-colors-button');

retrieveBoards();

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
function storeBoards() {
    const playerBoardString = JSON.stringify(playerBoard);
    const opponentBoardString = JSON.stringify(opponentBoard);

    localStorage.setItem(`playerBoard_${gameID}`, playerBoardString);
    localStorage.setItem(`opponentBoard_${gameID}`, opponentBoardString);
    localStorage.setItem(`canGuess_${gameID}`, canGuess);
    localStorage.setItem(`numLivesLeft_${gameID}`, numLivesLeft);
    localStorage.setItem(`numHitsLeft_${gameID}`, numHitsLeft);
}

// will pull from database instead of local storage
function retrieveBoards() {
    const playerBoardString = localStorage.getItem(`playerBoard_${gameID}`);
    const opponentBoardString = localStorage.getItem(`opponentBoard_${gameID}`);

    if (playerBoardString && opponentBoardString) {
        console.log("GETTING BOARDS");
        playerBoard = JSON.parse(playerBoardString);
        opponentBoard = JSON.parse(opponentBoardString);
        canGuess = localStorage.getItem(`canGuess_${gameID}`);
        numLivesLeft = parseInt(localStorage.getItem(`numLivesLeft_${gameID}`));
        numHitsLeft = parseInt(localStorage.getItem(`numHitsLeft_${gameID}`));
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);

        if(canGuess) {
            console.log("CAN GUESS");
            console.log(numLivesLeft);
            console.log(numHitsLeft);
            playerNameEl.textContent = opponentName + '\'s Board';
            if(numLivesLeft === 0 || numHitsLeft === 0) {
                console.log("GAME OVER");
                displayBoard(opponentBoard, 'board');
            } else {
                displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
            }
        } else {
            if(numLivesLeft === 0 || numHitsLeft === 0) {
                print("GAME OVER");
                displayBoard(playerBoard, 'board');
            } else {
                setTimeout(() => {
                    simulateOpponentGuess();
                }, 1000);
                storeBoards();
            }
        }
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
        playerNameEl.textContent = username + '\'s Board';
        displayBoard(playerBoard, 'board', handlePlayerCellClickPlacingShips);
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
    
    if(numShipsToPlace > 0 || playerBoard[row][col] === 4) {
        if(playerBoard[row][col] === 0) {
            playerBoard[row][col] = 4;
        } else {
            playerBoard[row][col] = 0;
        }

        updatePlayerBoardCell(event.target);

        if (numShipsToPlace === 0) {
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
        --numShipsToPlace;
    } else {
        cellElement.className = "open-cell";
        ++numShipsToPlace;
    }
}

// need to include updating opponent with Web Socket
function handlePlayerCellClickGuess(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;
    
    if(canGuess) {
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
                        storeBoards();
                        displayBoard(opponentBoard, 'board');
                    } else {
                        simulateOpponentGuess();
                    }
                }, 1000);
            } else {
                updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);
                storeBoards();
                setTimeout(() => {
                    simulateOpponentGuess();
                }, 1000);
            }
        } else {
            canGuess = false;
            opponentBoard[row][col] = 1;
            updateCellAppearanceOpponent(event.target, opponentBoard[row][col]);

            storeBoards();

            setTimeout(() => {
                simulateOpponentGuess();
            }, 1000);
        }

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
        alert("Board Finalized!");
        playerNameEl.textContent = opponentName + '\'s Board';
        displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
        storeBoards();
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
        --numLivesLeft;
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

    storeBoards();

    setTimeout(() => {
        playerNameEl.textContent = opponentName + '\'s Board';
        displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
        canGuess = true;
    }, 5000);
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

// store in database rather than local storage
function storeResults(didWin) {
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

generateColorButton.addEventListener('click', () => {
    console.log('PRESSED GENERATE COLOR');
    const openColor = openColorInput.value;
    const hexValues = openColor.match(/[0-9a-fA-F]{2}/g);
    const r = parseInt(hexValues[0], 16);
    const g = parseInt(hexValues[1], 16);
    const b = parseInt(hexValues[2], 16);
    
    const url = "http://colormind.io/api/";
    var data = {
        model: "default",
        input: [[r, g, b], "N", "N", "N"]
    };

    fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((jsonResponse) => {
        console.log(jsonResponse);
        const shipColor = rgbToHex(jsonResponse.result[1][0], jsonResponse.result[1][1], jsonResponse.result[1][2]);
        document.documentElement.style.setProperty('--ship-cell-color', shipColor);
        shipColorInput.value = shipColor;

        const hitColor = rgbToHex(jsonResponse.result[2][0], jsonResponse.result[2][1], jsonResponse.result[2][2]);        
        document.documentElement.style.setProperty('--hit-cell-color', hitColor);
        hitColorInput.value = hitColor;

        const missColor = rgbToHex(jsonResponse.result[3][0], jsonResponse.result[3][1], jsonResponse.result[3][2]);
        document.documentElement.style.setProperty('--miss-cell-color', missColor);
        missColorInput.value = missColor;
    })
    .catch((error) => {
        console.error("Error fetching color:", error);
    });
});

function rgbToHex(r, g, b) {
    const toHex = (value) => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(r) + toHex(g) + toHex(b);
}
