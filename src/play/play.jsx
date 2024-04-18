import React from 'react';

import { JoinGame }  from './game-hub';
import { PlayGame } from './play-game'
import { GameState } from './gameState';

import './play.css';

export function Play({ username, gameID, gameState, onGameChange }) {
  return (
    <main className='container-fluid'>
      {gameState === GameState.JoinGame && (
        <JoinGame username={username} gameID={gameID} onJoinGame={(gameID) => {
          onGameChange(gameID, GameState.InGame);
        }} /> 
      )}
      {gameState === GameState.InGame && (
        <PlayGame username={username} />
      )}
    </main>
  );
}