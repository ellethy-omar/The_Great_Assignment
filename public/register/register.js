document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
  
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent default form submission
  
      // Clear any previous messages
      messageDiv.textContent = '';
  
      // Get form field values
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
  
      if(validate(username, email, password, messageDiv) === false) {
        return;
      }
  
      // Build the request payload
      const payload = { username, email, password };
  
      try {
        const response = await fetch('http://localhost:4123/api/auth/register', {
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
          ocalStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          window.location.href = '/chat';
        }
      } catch (error) {
        console.error('Error during registration:', error);
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'An error occurred. Please try again later.';
      }
    });
});

const validate = (username, email, password, messageDiv) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!usernameRegex.test(username)) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Username must be alphanumeric (letters and numbers only).';
    return false;
  }

  // Validate email: basic pattern check
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Invalid email format.';
    return false;
  }

  // Validate password: minimum 7 characters and at least one number
  if (password.length < 7 || !/\d/.test(password)) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Password must be at least 7 characters long and contain at least one number.';
    return false;
  }
  return true;
}
  