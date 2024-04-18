import React from 'react';

import { Unauthenticated } from './unauthenticated';
import { Authenticated } from './authenticated';
import { AuthState } from './authState';

export function Login({ username, authState, onAuthChange }) {
  return (
    <main className="container-fluid">
      <div className="content">
        {authState !== AuthState.Unknown && <h1>Welcome to Battleship Online</h1>}
        {authState === AuthState.Authenticated && (
          <Authenticated username={username} onLogout={() => onAuthChange(username, AuthState.Unauthenticated)} />
        )}
        {authState === AuthState.Unauthenticated && (
          <Unauthenticated
            userName={username}
            onLogin={(loginUsername) => {
              onAuthChange(loginUsername, AuthState.Authenticated);
            }}
          />
        )}
      </div>
    </main>
  );
}