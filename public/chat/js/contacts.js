function showNotificationForChat(chatId) {
    const friendItems = document.querySelectorAll('#contactsList li');
    friendItems.forEach((item) => {
      if (item.getAttribute('data-chat-id') === chatId) {
        item.classList.add('has-notification');
      }
    });
}
  
function removeNotificationForChat(chatId) {
    const friendItems = document.querySelectorAll('#contactsList li');
    friendItems.forEach((item) => {
      if (item.getAttribute('data-chat-id') === chatId) {
        item.classList.remove('has-notification');
      }
    });
}

function isTypingIndicator(chatId, isTyping) {
    const friendItems = document.querySelectorAll('#contactsList li');
    friendItems.forEach((item) => {
      if (item.getAttribute('data-chat-id') === chatId) {
        if(isTyping === true) {
            const indicator = item.querySelector('span');
            if(indicator)
                return;
            
            const typingIndicator = document.createElement('span');
            typingIndicator.textContent = ' is typing a message ...';
            // Optionally style the typing indicator
            typingIndicator.style.fontStyle = 'italic';
            typingIndicator.style.fontSize = '0.9em';
            item.appendChild(typingIndicator);
        }
        else {
            item.removeChild(item.lastChild);
        }
      }
    });
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

            // Set a data attribute with the chat ID so we can find this element later
            friend.setAttribute('data-chat-id', item.chatId);

            friend.addEventListener('click', () => {
                loadChat(item.chatId);
                activeChat = {
                    chatId: item.chatId,
                    sender: user._id,
                    receiver: otherUser._id
                };


                const allFriends = document.querySelectorAll('.selectedFriend');
                allFriends.forEach(f => f.classList.remove('selectedFriend'));

                friend.classList.add('selectedFriend');
                document.getElementById('activeFriend').innerHTML = otherUser.username;
                
                // Remove notification indication when chat is opened
                removeNotificationForChat(item.chatId);
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