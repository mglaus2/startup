import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

import './form.css';

export function Authenticated(props) {
    const navigate = useNavigate();
    console.log(props.username);

    function logout() {
        fetch('/api/auth/logout', {
            method: 'DELETE',
        })
        .catch(() => {
            // Logout failed.
        })
        .finally(() => {
            localStorage.removeItem('username');
            props.onLogout();
        });
    }

    return (
        <div>
            <div className="playerName">{props.username}</div>
            <div className="buttons">
                <Button className="btn btn-primary" onClick={() => navigate('/play')}>Create/Join Game</Button>
                <Button className="btn btn-primary create-user" onClick={() => logout()}>Logout</Button>
            </div>
        </div>
    );
}