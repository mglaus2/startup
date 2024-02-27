const playerNameEl = document.getElementById('username'); 
playerNameEl.textContent = this.getPlayerName() + '\'s Leaderboard';

function getPlayerName() {
    return localStorage.getItem('username') ?? 'Mystery Player';
}