let showingRequestsFlag = false;
let activeChat = null;

document.getElementById('showRequestsBtn').addEventListener('click', async () => {
    if (showingRequestsFlag === true) {
        showingRequestsFlag = false;
        loadContactList();
    } else {
        showingRequestsFlag = true;
        loadPendingRequest();
    }
});

const loadPendingRequest = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;  
    try {
        const response = await fetch(`http://localhost:4123/api/friend/pending-requests/${encodeURIComponent(user._id)}`, {
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result);
            toggleContactsUI(result.data);

        } else {
            const result = await response.json();
            console.error(result.error);
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.log("error:", error);
    }
}

const loadContactList = async() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    try {
        const response = await fetch(`http://localhost:4123/api/friend/friends-list/${encodeURIComponent(user._id)}`, {
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + token
            }
        });
                
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            toggleContactsUI(result.data)
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

loadContactList();

const acceptRequest = async (requestId) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:4123/api/friend/accept-request/${encodeURIComponent(requestId)}`, {
            method: 'PUT',
            headers: {
                'authorization': 'Bearer ' + token
            }
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result);
        } else {
            const result = await response.json();
            console.error(result.error);
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn("error:", error);
    }
}

const declineRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:4123/api/friend/decline-request/${encodeURIComponent(requestId)}`, {
            method: 'PUT',
            headers: {
                'authorization': 'Bearer ' + token
            }
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result);
        } else {
            const result = await response.json();
            console.error(result.error);
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.warn("error:", error);
    }
}