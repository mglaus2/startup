async function handleFormSubmission() {
    const gameIDEl = document.getElementById('gameID');

    if (!gameIDEl.value) {
        alert("Please enter a GameID");
        return;
    }

    // This is where the websocket would set up the connection and get opponents name
    const opponentName = "Computer";

    const data = {
        gameID: gameIDEl.value,
        opponentName: opponentName,
    };

    try {
        const response = await fetch('/api/saveGameID', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        }); 
        
        const returnData = await response.json();
        const message = returnData.message;
        console.log(message);
        if(message === 'Game ID saved successfully') {
            alert(`Connected with ${opponentName} with GameID: ${gameIDEl.value}`);
            localStorage.setItem("gameID", gameIDEl.value);
            localStorage.setItem("opponentName", opponentName);
            window.location.href = "play.html";
        } else {
            alert('Server Error With Saving GameID');
        }
    } catch (error) {
        console.error("ERROR WITH SERVER:", error);
        localStorage.setItem("gameID", gameIDEl.value);
        localStorage.setItem("opponentName", opponentName);
    }
    //alert(`Connected with ${opponentName} with GameID: ${gameIDEl.value}`);
}