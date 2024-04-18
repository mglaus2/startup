import React from 'react';

import Button from 'react-bootstrap/Button';


import './play.css';
import { render } from 'react-dom';

export function PlayGame(props) {
    const [openColor, setOpenColor] = React.useState('#1e3d59');
    const [shipColor, setShipColor] = React.useState("#ffc13b");
    const [hitColor, setHitColor] = React.useState("#ff6e40");
    const [missColor, setMissColor] = React.useState("#593b1e");

    const [playerBoard, setPlayerBoard] = React.useState(createEmptyBoard());

    function createEmptyBoard() {
        return Array.from(Array(10), () => new Array(10).fill(0));
    }

    function renderBoard() {
        console.log(playerBoard);
        return playerBoard.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => (
                    <div 
                        key={colIndex}
                        className="board-cell"
                        style={{ backgroundColor: getCellColor(cell) }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                    </div>
                ))}
            </div>
        ));
    }

    function getCellColor(cellValue) {
        switch (cellValue) {
            case 0:
                return openColor;
            case 1:
                return shipColor;
            case 2:
                return hitColor;
            case 3:
                return missColor;
            default:
                return openColor;
        }
    }

    function handleCellClick(rowIndex, colIndex) {
        const updatedBoard = [...playerBoard];
            
        if (playerBoard[rowIndex][colIndex] === 0) {
            updatedBoard[rowIndex][colIndex] = 4;
        } else {
            updatedBoard[rowIndex][colIndex] = 0;
        }
    
        setPlayerBoard(updatedBoard);
    }

    async function generateColors() {
        const hexValues = openColor.match(/[0-9a-fA-F]{2}/g);
        const r = parseInt(hexValues[0], 16);
        const g = parseInt(hexValues[1], 16);
        const b = parseInt(hexValues[2], 16);
        
        const colorAPIUrl = 'https://www.thecolorapi.com/scheme';
    
        const params = {
            hex: openColor,
            mode: 'analogic-complement',
            count: 4,
        };
    
        const queryString = Object.keys(params)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
    
        const apiUrlWithParams = `${colorAPIUrl}?${queryString}`;
    
        fetch(apiUrlWithParams)
            .then(response => response.json())
            .then(data => setColors(data))
            .catch(error => console.error('Error:', error));
    }
    
    function setColors(data) {
        console.log(data);
        console.log(data.colors[1].hex.value)
    
        const newShipColor = data.colors[1].hex.value;
        const newHitColor = data.colors[2].hex.value;
        const newMissColor = data.colors[3].hex.value;
    
    
        setShipColor(newShipColor);
        setHitColor(newHitColor);
        setMissColor(newMissColor);
    }

    return (
        <>
            <div id="playGame">
                <h1 id="username">{props.username}'s Board</h1>
                <div className="grid-and-colors">
                <div id="board" className="grid">
                    {renderBoard()}
                </div>
            
                <div className="pick-colors">
                    <h3>Pick Colors:</h3>
                    <div>
                        <span>Open Space Color:</span>
                        <input className="color-input" type="color" id="openColor" value={openColor} onChange={(e) => setOpenColor(e.target.value)}/>
                    </div>
                    <div>
                        <span>Sunk Ship Color:</span>
                        <input className="color-input" type="color" id="shipColor" value={shipColor} onChange={(e) => setShipColor(e.target.value)}/>
                    </div>
                    <div>
                        <span>Hit Ship Color:</span>
                        <input className="color-input" type="color" id="hitColor" value={hitColor} onChange={(e) => setHitColor(e.target.value)}/>
                    </div>
                    <div>
                        <span>Miss Color:</span>
                        <input className="color-input" type="color" id="missColor" value={missColor} onChange={(e) => setMissColor(e.target.value)}/>
                    </div>
                    <Button id="generate-colors-button" className="btn btn-primary final" onClick={() => generateColors()}>Generate Contrasting Color</Button>
                </div>
                </div>
            </div>
        </>
    );
}