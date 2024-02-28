function login() {
    const usernameEl = document.getElementById('name');
    const passwordEl = document.getElementById('password');

    if(!usernameEl.value || !passwordEl.value) {
        alert("Please enter valid username or password");
        return;
    }
    
    // validate and/or store username and encoded password into the database
    localStorage.setItem("username", usernameEl.value);
    localStorage.setItem("password", passwordEl.value);

    window.location.href = "game-hub.html";
}