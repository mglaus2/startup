import React from 'react';

import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';

import './play.css';

export function JoinGame(props) {
    const [gameID, setGameID] = React.useState(props.gameID);
    const [displayMessage, setMessage] = React.useState(null);

    async function joinGame() {
        if (!gameID) {
            console.log('error');
            setMessage(`⚠ Error: Not a Valid Game ID`);
            return;
        } 

        const data = {
            username: props.username,
            gameID: gameID,
        };
    
        const response = await fetch('/api/game/join', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        }); 
    
        const returnData = await response.json();
    
        if(response.ok) {
            console.log("GOOD RESPONSE");
            localStorage.setItem("gameID", gameID);
            props.onJoinGame(gameID);
            //configureWebSocket();
        } else {
            setMessage(`⚠ Error: ${returnData.msg}`);
        }
    }


    return (
        <>
            <div className='container'>
                <div className='container'>
                    <h1>Create or Join Game</h1>
                        <div className="form-input">
                            <span className="gameID">GameID:</span>
                            <input type="text" id="gameID" placeholder="Your GameID Here" onChange={(e) => setGameID(e.target.value)} required />
                        </div>
                        <Button type="button" className="btn btn-primary" onClick={() => joinGame()} >Create or Join Game</Button>
                </div>
            </div>

            <MessageDialog message={displayMessage} onHide={() => setMessage(null)} />
        </>
    );
}