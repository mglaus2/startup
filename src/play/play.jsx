import React from 'react';

import { JoinGame }  from './game-hub';
//import { PlayGame } from './play-game'
import { GameState } from './gameState';

import './play.css';

export function Play({ username, gameState, onGameChange }) {
  return (
    <main className='container-fluid'>
      {gameState === GameState.JoinGame && (
        <JoinGame username={username} onJoinGame={(gameID) => {
          onGameChange(gameID, GameState.InGame);
        }} /> 
      )}
    </main>
  );
}