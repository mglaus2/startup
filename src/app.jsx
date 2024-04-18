import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Leaderboard } from './leaderboard/leaderboard';
import { AuthState } from './login/authState';
import { GameState } from './play/gameState';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  const [username, setUsername] = React.useState(localStorage.getItem('username') || '');
  const currentAuthState = username ? AuthState.Authenticated : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  const [gameID, setGameID] = React.useState(localStorage.getItem('gameID') || '');
  const currentGameState = gameID ? GameState.InGame : GameState.JoinGame;
  const [gameState, setGameState] = React.useState(currentGameState);

  return (
    <BrowserRouter>
      <div className="body">
        <header className="container-fluid">
          <nav className="navbar">
            <NavLink className="navbar-brand" to="">Battleship</NavLink>
            <menu className="navbar-nav">
              <li className="nav-item"><NavLink className="nav-link" to="">Home</NavLink></li>
              {authState === AuthState.Authenticated && (
                <li className='nav-item'>
                  <NavLink className='nav-link' to='play'>
                    Play
                  </NavLink>
                </li>
              )}
              {authState === AuthState.Authenticated && (
                <li className='nav-item'>
                  <NavLink className='nav-link' to='leaderboard'>
                    Leaderboard
                  </NavLink>
                </li>
              )}
            </menu>
          </nav>
        </header>

        <Routes className="content">
          <Route path='/' element={
            <Login 
              username={username}
              authState={authState}
              onAuthChange={(username, authState) => {
                setAuthState(authState);
                setUsername(username);
                setGameID('');
                setGameState(GameState.JoinGame);
              }}
            />
          } 
          exact 
          />
          <Route path='/play' element={
            <Play 
              username={username}
              gameState={gameState}
              onGameChange={(gameID, gameState) => {
                setGameState(gameState);
                setGameID(gameID);
              }}
            />
          } 
          exact
          />
          <Route path='/leaderboard' element={<Leaderboard username={username} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <footer className="text-dark">
          <span className="text-reset">By: Matthew Glaus</span>
          <a href="https://github.com/mglaus2/startup">My Startup Github Repo</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}