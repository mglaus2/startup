async function login() {
    const usernameEl = document.getElementById('name');
    const passwordEl = document.getElementById('password');

    if(!usernameEl.value || !passwordEl.value) {
        alert("Please enter valid username or password");
        return;
    }
    
    const data = {
        username: usernameEl.value,
    };

    try {
        const response = await fetch('/api/saveUsername', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(data),
        });
        
        const returnData = await response.json();
        const message = returnData.message;
        console.log(message);
        if(message === 'Username saved successfully') {
            alert('Server Success for Saving Username');
            localStorage.setItem("username", usernameEl.value);
            localStorage.setItem("password", passwordEl.value);
        }
    } catch {
        alert('Server Error with Saving Username');
        localStorage.setItem("username", usernameEl.value);
        localStorage.setItem("password", passwordEl.value);
    }
    
    window.location.href = "game-hub.html";
}