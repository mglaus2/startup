function handleFormSubmission() {
    const gameIDEl = document.getElementById('gameID');

    if (!gameIDEl.value) {
        alert("Please enter a GameID");
        return;
    }

    localStorage.setItem("gameID", gameIDEl.value);

    // This is where the websocket would set up the connection and get opponents name
    const opponentName = "Computer";
    localStorage.setItem("opponentName", opponentName);
    alert(`Connected with ${opponentName} with GameID: ${gameIDEl.value}`);

    window.location.href = window.location.href = "play.html";
}