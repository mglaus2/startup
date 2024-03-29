document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    console.log('Username: ', username);
    if (username) {
        document.getElementById('playerName').textContent = username;
        setDisplay('loginControls', 'none');
        setDisplay('playControls', 'block');
        const h1Element = document.querySelector('main h1');
        h1Element.style.marginBottom = '1vh';
    } else {
        setDisplay('loginControls', 'block');
        setDisplay('playControls', 'none');
        const h1Element = document.querySelector('main h1');
        h1Element.style.marginBottom = '3vh';
    }
});

async function loginUser() {
    loginOrCreate('/api/auth/login');
}

async function createUser() {
    loginOrCreate('/api/auth/create');
}

async function loginOrCreate(endpoint) {
    const usernameEl = document.getElementById('name');
    const passwordEl = document.getElementById('password');

    if(!usernameEl.value || !passwordEl.value) {
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: Please enter valid username or password`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
        return;
    }

    const data = {
        username: usernameEl.value,
        password: passwordEl.value,
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
    });

    if (response.ok) {
        localStorage.setItem("username", usernameEl.value);
        window.location.href = "game-hub.html";
    } else {
        const body = await response.json();
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${body.msg}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }
}

async function goToGameHub() {
    window.location.href = 'play.html';
}

async function logout() {
    localStorage.removeItem('username');
    fetch('/api/auth/logout', {
        method: 'DELETE',
    }).then(() => (window.location.href = '/'));
}

function setDisplay(controlId, display) {
    console.log(controlId);
    const playControlEl = document.getElementById(`${controlId}`);
    console.log('IN SET DISPLAY');
    console.log(playControlEl);
    if (playControlEl) {
        console.log('Setting element display');
        playControlEl.style.display = display;
    }
}