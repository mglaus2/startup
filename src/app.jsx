import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="body">
      <header className="container-fluid">
      <nav className="navbar">
        <a className="navbar-brand" href="index.html">Battleship</a>
        <menu className="navbar-nav">
          <li className="nav-item"><a className="nav-link" href="index.html">Home</a></li>
          <li className="nav-item"><a className="nav-link" href="play.html">Current Game</a></li>
          <li className="nav-item"><a className="nav-link active" href="leaderboard.html">Leaderboard</a></li>
        </menu>
      </nav>
    </header>

    <main>App components go here</main>

    <footer className="text-dark">
      <span className="text-reset">By: Matthew Glaus</span>
      <a href="https://github.com/mglaus2/startup">My Startup Github Repo</a>
    </footer>
    </div>
  );
}