let showingRequestsFlag = false;

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

function toggleContactsUI(list) {
    const requestsList = document.getElementById('friendRequests');
    const FriendsList = document.getElementById('contactsList');
    const titleFriends = document.getElementById('Friends');
    const showRequestsBtn = document.getElementById('showRequestsBtn');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null; 

    if(showingRequestsFlag === true) {
        FriendsList.classList.remove('active');
        while(FriendsList.firstChild) 
            FriendsList.removeChild(FriendsList.firstChild);

        list.forEach((item) => {
            const friendRequest = document.createElement('li');
            friendRequest.style.display = 'flex';
            friendRequest.style.flexDirection = 'column';  

            const otherUser = item.sender._id === user._id ? item.receiver : item.sender;
            friendRequest.innerHTML = otherUser.username;

            requestsList.appendChild(friendRequest);

            const acceptBtn = document.createElement('button');
            acceptBtn.classList.add('accept-btn'); 
            acceptBtn.innerHTML = 'Accept';
            acceptBtn.addEventListener('click', () => {
                acceptRequest(item._id).then(() => {
                    friendRequest.remove();
                });
            });
            friendRequest.appendChild(acceptBtn);

            const declineBtn = document.createElement('button');
            declineBtn.classList.add('decline-btn');
            declineBtn.innerHTML = 'Decline';
            declineBtn.addEventListener('click', () => {
                declineRequest(item._id).then(() => {
                    friendRequest.remove();
                });
            });
            friendRequest.appendChild(declineBtn);
            
        });
        
        titleFriends.innerHTML = 'Friend Requests';
        showRequestsBtn.innerHTML = 'Show Friends';
        requestsList.classList.add('active');
    } else {
        requestsList.classList.remove('active');

        while(requestsList.firstChild) 
            requestsList.removeChild(requestsList.firstChild);

        FriendsList.classList.add('active');

        list.forEach((item) => {
            const friend = document.createElement('li');
            friend.style.display = 'flex';
            friend.style.flexDirection = 'column';

            const otherUser = item.friend;
            friend.innerHTML = otherUser.username;

            friend.addEventListener('click', ()=> {
                loadChat(item.chatId);
                const allFriends = document.querySelectorAll('.selectedFriend');
                allFriends.forEach(f => f.classList.remove('selectedFriend'));

                friend.classList.add('selectedFriend');
                document.getElementById('activeFriend').innerHTML = otherUser.username;
            });

            FriendsList.appendChild(friend);
        });

        titleFriends.innerHTML = 'Friends';
        showRequestsBtn.innerHTML = 'Show Friends Requests';
    }
}

const addFriendBtn = document.getElementById('addFriendBtn');
const friendOverlay = document.getElementById('friendOverlay');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');

addFriendBtn.addEventListener('click', () => {
    friendOverlay.style.display = 'flex';
});

closeOverlayBtn.addEventListener('click', () => {
    friendOverlay.style.display = 'none';
});

document.getElementById('submitFriendBtn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const friendUsername = document.getElementById('friendUsername').value;
    console.log(friendUsername);
    try {
        const response = await fetch('http://localhost:4123/api/friend/send-request-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ senderId: user._id, username: friendUsername })
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result);
        } else {
            const result = await response.json();
            alert(result.error);
            console.error(result.error);
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

const searchInput = document.getElementById('friendSearch');
const contactsList = document.getElementById('contactsList');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const contacts = contactsList.getElementsByTagName('li');

    Array.from(contacts).forEach(contact => {
      const name = contact.textContent.toLowerCase();
      if (name.includes(query)) {
        contact.style.display = '';
      } else {
        contact.style.display = 'none';
      }
    });
  });