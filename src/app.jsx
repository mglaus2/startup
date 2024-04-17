import React from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Leaderboard } from './leaderboard/leaderboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="body">
        <header className="container-fluid">
          <nav className="navbar">
            <NavLink className="navbar-brand" to="">Battleship</NavLink>
            <menu className="navbar-nav">
              <li className="nav-item"><NavLink className="nav-link" to="">Home</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="play">Current Game</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link active" to="leaderboard">Leaderboard</NavLink></li>
            </menu>
          </nav>
        </header>

        <Routes>
          <Route path='/' element={<Login />} exact />
          <Route path='/play' element={<Play />} />
          <Route path='/leaderboard' element={<Leaderboard />} />
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