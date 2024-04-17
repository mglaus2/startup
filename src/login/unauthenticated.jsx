import React from 'react';

import Button from 'react-bootstrap/Button';
import {MessageDialog} from './messageDialog';

import './form.css'

export function Unauthenticated(props) {
    const [username, setUsername] = React.useState(props.username);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        loginOrCreate('/api/auth/login');
    }
    
    async function createUser() {
        loginOrCreate('/api/auth/create');
    }

    async function loginOrCreate(endpoint) {
        console.log(username);
        console.log(password);

        const data = {
            username: username,
            password: password,
        };
    
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        });
    
        if (response.ok) {
            localStorage.setItem("username", username);
            props.onLogin(username);
        } else {
            const body = await response.json();
            setDisplayError(`⚠ Error: ${body.msg}`);
        }
    }

    return (
        <>
            <div className="container">
                <div className="form-input">
                    <span className="username" >Username:</span>
                    <input id="name" type='text' value={username} placeholder="Your Username Here" onChange={(e) => setUsername(e.target.value)} required />
                </div>

                <div className="form-input">
                    <span className="password">Password:</span>
                    <input type="password" id="password" placeholder="Your Password Here" onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="buttons">
                    <Button className="btn btn-primary" onClick={() => loginUser()}>Login</Button>
                    <Button className="btn btn-primary create-user" onClick={() => createUser()} >Create User</Button>
                </div>
            </div>

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    );
}