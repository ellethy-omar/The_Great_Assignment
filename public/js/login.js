document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const token = localStorage.getItem('token');

    console.log(token);

    if(token) {
        window.location.href = '/chat';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        messageDiv.textContent = '';
        
        const usernameOrEmail = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        const payload = { usernameOrEmail, password };
  
        try {
            const response = await fetch('http://localhost:4123/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            const result = await response.json();
            console.log(response);
    
            if (!response.ok) {
                // Display error message from the server
                messageDiv.style.color = 'red';
                messageDiv.textContent = result.error || 'Registration failed';
            } else {
                // Registration successful
                messageDiv.style.color = 'green';
                messageDiv.textContent = result.message || 'Registration successful!';
        
                // Optionally, store the token and redirect to a protected page
                localStorage.setItem('token', result.token);
                window.location.href = '/chat';
            }
        } catch (error) {
            console.error('Error during registration:', error);
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'An error occurred. Please try again later.';
        }
    });
})