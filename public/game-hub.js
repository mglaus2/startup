async function handleFormSubmission() {
    const gameIDEl = document.getElementById('gameID');
    const username = localStorage.getItem('username');
    console.log(username);

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

    const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    }); 

    const returnData = await response.json();

    if(response.ok) {
        console.log("GOOD RESPONSE");
        storeGameStateLocal(returnData, gameIDEl.value);
        window.location.href = "play.html";
    } else {
        console.log("ERROR RESPONSE");
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${returnData.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }
}

function storeGameStateLocal(returnData, gameID) {
    const hostBoardString = JSON.stringify(returnData.hostBoard);
    const opponentBoardString = JSON.stringify(returnData.opponentBoard);

    localStorage.setItem('gameID', gameID);
    localStorage.setItem('opponentName', returnData.opponentName);
    localStorage.setItem('hostBoard', hostBoardString);
    localStorage.setItem('opponentBoard', opponentBoardString);
    localStorage.setItem('turn', returnData.turn);
    localStorage.setItem('numShipsToPlaceHost', returnData.numShipsToPlaceHost);
    localStorage.setItem('numShipsToPlaceOpponent', returnData.numShipsToPlaceOpponent);
    localStorage.setItem('numHostLivesLeft', returnData.numHostLivesLeft);
    localStorage.setItem('numOpponentLivesLeft', returnData.numOpponentLivesLeft);
}