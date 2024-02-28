const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Board';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}

// 0 is open space, 1 is missed shot, 2 is hit ship, 3 is sunk ship
userBoard = [
    [2, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 3, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 2, 0, 0, 0, 0, 1],
];

const gameGrid = document.getElementById('gameGrid');
userBoard.forEach(row => {
row.forEach(cell => {   
        const cellElement = document.createElement('div');

        if (cell === 0) {
            cellElement.className = 'open-cell';
        } else if (cell === 1) {
            cellElement.className = 'miss-cell';
        } else if (cell === 2) {
            cellElement.className = 'hit-cell';
        } else {
            cellElement.className = 'ship-cell';
        }

        gameGrid.appendChild(cellElement);
    });
});