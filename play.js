const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Board';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}

const numRowsAndCols = 10;

let playerBoard = createEmptyBoard();
let opponentBoard = createEmptyBoard();
let numShipsToPlace = 10;

displayBoard(opponentBoard, 'board', handlePlayerCellClickPlacingShips);

function createEmptyBoard() {
    return Array.from(Array(numRowsAndCols), () => new Array(numRowsAndCols).fill(0));
}

function displayBoard(board, boardId, cellClickHandler) {
    const gameGrid = document.getElementById(boardId);
    gameGrid.innerHTML = '';

    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            const cell = document.createElement('div');
            cell.className = 'open-cell';
            cell.dataset.position = row * numRowsAndCols + col;

            // Add click event listener for the player's board during ship placement
            if (cellClickHandler) {
                cell.addEventListener('click', cellClickHandler);
            }

            // Update cell appearance based on the board value
            updateCellAppearance(cell, board[row][col]);

            gameGrid.appendChild(cell);
        }
    }
}

function handlePlayerCellClickPlacingShips(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;
    
    if(numShipsToPlace > 0 || playerBoard[row][col] === 3) {
        if(playerBoard[row][col] === 0) {
            playerBoard[row][col] = 3;
        } else {
            playerBoard[row][col] = 0;
        }

        updatePlayerBoardCell(event.target);

        if (numShipsToPlace === 0) {
            setTimeout(() => {
                if (validateShips()) {
                    alert("Switching to guessing mode!");
                    displayBoard(opponentBoard, 'board', handlePlayerCellClickGuess);
                } else {
                    alert("Invalid ships");
                }
            }, 0);
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
    
    const result = opponentBoard[row][col] === 1 ? 2 : 1;
    opponentBoard[row][col] = result;
    updateCellAppearance(event.target, result);
}

function updateCellAppearance(cellElement, cellValue) {
    if (cellValue === 0) {
        cellElement.className = 'open-cell';
    } else if (cellValue === 1) {
        cellElement.className = 'miss-cell';
    } else if (cellValue === 2) {
        cellElement.className = 'hit-cell';
    } else {
        cellElement.className = 'ship-cell';
    }
}

function validateShips() {
    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            if (playerBoard[row][col] === 3) {
                if (row - 1 >= 0 && playerBoard[row - 1][col] === 3) {
                    continue;
                }
                if (row + 1 < numRowsAndCols && playerBoard[row + 1][col] === 3) {
                    continue;
                }
                if (col - 1 >= 0 && playerBoard[row][col - 1] === 3) {
                    continue;
                }
                if (col + 1 < numRowsAndCols && playerBoard[row][col + 1] === 3) {
                    continue;
                }

                return false;
            }
        }
    }

    return true;
}
