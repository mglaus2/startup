const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Board';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}

const numRowsAndCols = 10;

let playerBoard = createEmptyBoard();
let opponentBoard = createEmptyBoard();
let numShipsToPlace = 10;

displayBoard(playerBoard, 'playerBoard', handlePlayerCellClick);

function createEmptyBoard() {
    return Array.from({ length: numRowsAndCols }, () => Array(numRowsAndCols).fill(0));
}

function displayBoard(board, boardId, cellClickHandler) {
    const gameGrid = document.getElementById(boardId);

    for (let row = 0; row < numRowsAndCols; row++) {
        for (let col = 0; col < numRowsAndCols; col++) {
            const cell = document.createElement('div');
            cell.className = 'open-cell';
            cell.dataset.position = row * numRowsAndCols + col;

            // Add click event listener for the player's board during ship placement
            if (cellClickHandler && numShipsToPlace > 0) {
                cell.addEventListener('click', cellClickHandler);
            }

            // Update cell appearance based on the board value
            updateCellAppearance(cell, board[row][col]);

            gameGrid.appendChild(cell);
        }
    }
}

function handlePlayerCellClick(event) {
    const position = parseInt(event.target.dataset.position);
    const row = Math.floor(position / numRowsAndCols);
    const col = position % numRowsAndCols;
    if (numShipsToPlace > 0) {
        // Place a ship on the player's board
        playerBoard[row][col] = 1; // 1 represents a ship

        // Update the visual appearance of the clicked cell
        updateOpponentsBoardCell(event.target, playerBoard[row][col]);
    } else {
        // Simulate a guess and update the opponent's board
        const result = opponentBoard[row][col] === 1 ? 2 : 1; // 2 represents a hit, 1 represents a miss
        opponentBoard[row][col] = result;

        // Update the visual appearance of the clicked cell
        updateCellAppearance(event.target, result);
    }
}

function updateOpponentsBoardCell(cellElement) {
    if(cellElement.className === "open-cell") {
        cellElement.className = "ship-cell";
        --numShipsToPlace;
    } else {
        cellElement.className = "open-cell";
        ++numShipsToPlace;
    }
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