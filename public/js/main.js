document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById ('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
          console.log('Logging out');
            localStorage.removeItem('token');
            window.location.href = '../';
        });
    }
});
  