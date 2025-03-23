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


const loadChat = async (chadId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:4123/api/chat/getChatById/${encodeURIComponent(chadId)}`, {
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            const result = await response.json();

            showChat(result);
            return result;
        } else {
            const result = await response.json();
            console.error(result.error);
            window.href = "../";
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const showChat = (chat) => {
    console.log(chat);
}


