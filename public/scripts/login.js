document.addEventListener('DOMContentLoaded', () => {
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Function to show login form
    function showLoginForm() {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
    }

    // Function to show register form
    function showRegisterForm() {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
    }

    // Check URL for 'register=true' to show the register form
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('register') && urlParams.get('register') === 'true') {
        showRegisterForm();
    } else {
        showLoginForm();
    }

    // Event listeners for manual toggling
    loginToggle.addEventListener('click', showLoginForm);
    registerToggle.addEventListener('click', showRegisterForm);

    // Handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
    
        if (!username || !password) {
            document.getElementById('login-error-message').textContent = 'Username and password are required.';
            return;
        }

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                // Redirect to the dashboard or another page after successful login
                window.location.href = '/dashboard';  // Adjust this to the correct route
            } else {
                const errorMessage = await response.json();
                document.getElementById('login-error-message').textContent = errorMessage.error || 'Login failed. Please try again.';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('login-error-message').textContent = 'An error occurred. Please try again.';
        }
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim(); 
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('confirm-password').value.trim();

        if (!username || !email || !password || !confirmPassword) {
            document.getElementById('register-error-message').textContent = 'All fields are required.';
            return;
        }

        if (password !== confirmPassword) {
            document.getElementById('register-error-message').textContent = 'Passwords do not match.';
            return;
        }

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }) 
            });

            if (response.ok) {
                window.location.href = '/dashboard'; // Redirect after successful registration
            } else {
                const errorMessage = await response.json();
                document.getElementById('register-error-message').textContent = errorMessage.error || 'Registration failed. Please try again.';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('register-error-message').textContent = 'An error occurred. Please try again.';
        }
    });
});
