const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Board';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}