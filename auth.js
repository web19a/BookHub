// Initialize default admin
const ADMIN = {
    name: "Admin User",
    email: "admin@bookhub.com",
    password: "Admin123!",
    role: "admin",
    joined: new Date().toISOString()
};

// Initialize users
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([ADMIN]));
}

function toggleForm() {
    document.getElementById('flipper').classList.toggle('flipped');
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users'));
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.reload();
    } else {
        alert('Invalid credentials');
    }
}

function register() {
    const users = JSON.parse(localStorage.getItem('users'));
    const newUser = {
        name: document.getElementById('registerName').value,
        email: document.getElementById('registerEmail').value,
        password: document.getElementById('registerPassword').value,
        role: 'user',
        joined: new Date().toISOString()
    };

    if (users.some(u => u.email === newUser.email)) {
        alert('Email already registered');
        return;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.reload();
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.reload();
}