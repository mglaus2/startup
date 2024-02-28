const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Board';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}

// 0 is open cell, 1 is miss, 2 is hit, 3 is sunk ship, and 4 is ship is there but not interacted with
// WOULD GET OPPONENTS BOARD THROUGH WEB SOCKETS BUT NOW CREATED WITH DUMMY DATA
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

const numRowsAndCols = 10;

let playerBoard = createEmptyBoard();
let numShipsToPlace = 10;
let numHitsLeft = 10;

displayBoard(playerBoard, 'board', handlePlayerCellClickPlacingShips);
const finalizeBoardButton = document.getElementById('finalize-board-button');
finalizeBoardButton.disabled = true;

function createEmptyBoard() {
    return Array.from(Array(numRowsAndCols), () => new Array(numRowsAndCols).fill(0));
}

function displayBoard(board, boardId, cellClickHandler) {
    const gameGrid = document.getElementById(boardId);
    gameGrid.innerHTML = '';

    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            const cell = document.createElement('div');
            cell.dataset.position = row * numRowsAndCols + col;

            cell.addEventListener('click', cellClickHandler);

            updateCellAppearance(cell, board[row][col]);

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
            if (validateShips()) {
                finalizeBoardButton.disabled = false;
            } else {
                alert("Invalid ships");
            }
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

function handlePlayerCellClickGuess(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;
    
    if(opponentBoard[row][col] === 1 || opponentBoard[row][col] === 2 || opponentBoard[row][col] === 3) {
        alert("Invalid Guess.");
    } else if(opponentBoard[row][col] === 4) {
        opponentBoard[row][col] = 2;
        --numHitsLeft;
        let tempMatrix = createEmptyBoard();
        console.log("CHECKING IF SUNK");
        if(checkIfSunk(row, col, tempMatrix, true)) {
            displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
            if(numHitsLeft === 0) {
                alert("YOU WON!");
            }
        } else {
            updateCellAppearance(event.target, opponentBoard[row][col]);
        }
    } else {
        opponentBoard[row][col] = 1;
        updateCellAppearance(event.target, opponentBoard[row][col]);
    }
}

function updateCellAppearance(cellElement, cellValue) {
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
    alert("Board Finalized!");
    displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
    finalizeBoardButton.parentNode.removeChild(finalizeBoardButton);
});

function checkIfSunk(row, col, tempMatrix, firstIteration) {
    console.log(`Checking cell (${row}, ${col})`);
    if (row < 0 || row >= numRowsAndCols || col < 0 || col >= numRowsAndCols || tempMatrix[row][col] === 3 || tempMatrix[row][col] === 1) {
        return true;
    }

    if(!firstIteration) {
        if (opponentBoard[row][col] !== 4) {
            if(opponentBoard[row][col] === 2) {
                tempMatrix[row][col] = 3;
                const isSunk =
                    checkIfSunk(row - 1, col, tempMatrix, false) &&
                    checkIfSunk(row + 1, col, tempMatrix, false) &&
                    checkIfSunk(row, col - 1, tempMatrix, false) &&
                    checkIfSunk(row, col + 1, tempMatrix, false);
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
        checkIfSunk(row - 1, col, tempMatrix, false) &&
        checkIfSunk(row + 1, col, tempMatrix, false) &&
        checkIfSunk(row, col - 1, tempMatrix, false) &&
        checkIfSunk(row, col + 1, tempMatrix, false);

    if(isSunk) {
        console.log(tempMatrix);
        for (let row = 0; row < numRowsAndCols; row++) {
            for (let col = 0; col < numRowsAndCols; col++) {
                if (tempMatrix[row][col] === 3) {
                    opponentBoard[row][col] = 3;
                }
            }
        }
    }
    return isSunk;
}
