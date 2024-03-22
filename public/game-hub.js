async function handleFormSubmission() {
    const gameIDEl = document.getElementById('gameID');
    const username = localStorage.getItem('username');

    if (!gameIDEl.value) {
        alert("Please enter a GameID");
        return;
    }

    // This is where the websocket would set up the connection and get opponents name
    const opponentName = "Computer";

    const data = {
        username: username,
        gameID: gameIDEl.value,
    };

    try {
        const response = await fetch('/api/joinGame', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        }); 
        
        const returnData = await response.json();
        storeGameStateLocal(returnData, gameIDEl.value);
        window.location.href = "play.html";
    } catch (error) {
        alert('Server Error With Saving GameID');
        console.error("ERROR WITH SERVER:", error);
        localStorage.setItem("gameID", gameIDEl.value);
        localStorage.setItem("opponentName", opponentName);
    }

    //alert(`Connected with ${opponentName} with GameID: ${gameIDEl.value}`);
}

function storeGameStateLocal(returnData, gameID) {
    localStorage.setItem('gameID', gameID);
    localStorage.setItem('opponentName', returnData.opponentName);
    localStorage.setItem('hostBoard', returnData.hostBoard);
    localStorage.setItem('opponentBoard', returnData.opponentBoard);
    localStorage.setItem('turn', returnData.turn);
    localStorage.setItem('numShipsToPlaceHost', returnData.numShipsToPlaceHost);
    localStorage.setItem('numShipsToPlaceOpponent', returnData.numShipsToPlaceOpponent);
    localStorage.setItem('numHostLivesLeft', returnData.numHostLivesLeft);
    localStorage.setItem('numOpponentLivesLeft', returnData.numOpponentLivesLeft);
}