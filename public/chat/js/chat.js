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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const showChat = (chat) => {
    const chatWindow = document.getElementById('chatWindow');
    const sendMsgBtn = document.getElementById('sendMsgBtn');
    sendMsgBtn.disabled = false;
    sendMsgBtn.classList.remove('disabled');
  
    // Clear any previous messages
    chatWindow.innerHTML = '';
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const currentUserId = user._id;
    
    // Loop through messages and create message divs
    console.log(chat.messages)
    chat.messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message');
      
      // Check if the message was sent by the current user
      const isCurrentUser = (String(message.sender._id) === String(currentUserId));
      if (isCurrentUser) {
        messageDiv.classList.add('sent');
      } else {
        messageDiv.classList.add('received');
      }
      
      // Create message content element
      const contentPara = document.createElement('p');
      contentPara.textContent = message.content;
      
      // Create timestamp element
      const timestampSpan = document.createElement('span');
      timestampSpan.classList.add('timestamp');
      timestampSpan.textContent = formatDate(message.createdAt);
      
      messageDiv.appendChild(contentPara);
      messageDiv.appendChild(timestampSpan);
  
      // If the current user sent the message, add a status indicator
      if (isCurrentUser) {
        const statusSpan = document.createElement('span');
        statusSpan.classList.add('status');
        
        // Determine the status
        if (message.readAt) {
          statusSpan.textContent = 'Read';
          statusSpan.style.color = 'green';
        } else {
          statusSpan.textContent = 'Sent';
          statusSpan.style.color = '#888';
        }
        
        messageDiv.appendChild(statusSpan);
      }
      
      chatWindow.appendChild(messageDiv);
    });
  
    chatWindow.scrollTop = chatWindow.scrollHeight;
  
    const unreadMessages = chat.messages.filter(message =>
      String(message.receiver._id) === String(currentUserId) && !message.readAt
    );
    
    if (unreadMessages.length > 0) {
      markMessagesAsRead(chat._id, unreadMessages.map(msg => msg._id));
    }
  };
  

function markMessagesAsRead(chatId, messageIds) {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'markAsRead',
        data: { chatId, messageIds, readAt: new Date() }
      }));
    }
}

const sendMessage = async (content) => {
    if(!activeChat) {
        console.error("No active chat found");
    }
        
    if(!content || content === "")
        return;

    const token = localStorage.getItem('token');

    const { chatId, sender, receiver } = activeChat;

    // console.log(activeChat);

    try {
        const response = await fetch(`http://localhost:4123/api/chat/addMessageToChat/${encodeURIComponent(chatId)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ sender, receiver, content })
        });

        if (response.ok) {
            loadChat(chatId);
        } else {
            const result = await response.json();
            console.error(result.error);
        }
        if (response.status !== 200) {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const messageInput = document.getElementById("messageInput");

// A simple debounce function to avoid flooding the server with messages
let typingTimeout;
messageInput.addEventListener('input', () => {
    // Notify the server that the user is typing
    if(!activeChat)
        return;

    ws.send(JSON.stringify({
        type: "isTyping",
        data: {
            activeChat,  // ensure activeChat is set properly
            isTyping: true
        }
    }));

    // Clear the previous timeout and set a new one to send a "stopped typing" message
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        ws.send(JSON.stringify({
            type: "isTyping",
            data: {
                activeChat,
                isTyping: false
            }
        }));
    }, 3000); // 1 second after the last keystroke, consider that the user stopped typing
});


document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const content = messageInput.value;
        sendMessage(content).then(() => {
            messageInput.value = "";
        });
    }
    
    if(event.key === 'Escape') {
        messageInput.value = "";
        activeChat = null;
        const chatWindow = document.getElementById('chatWindow');
    
        chatWindow.innerHTML = '';
        const selectedFriend = document.querySelector('#contactsList li.selectedFriend');
        selectedFriend.classList.remove('selectedFriend');

        const sendMsgBtn = document.getElementById('sendMsgBtn');
        sendMsgBtn.disabled = true;
        sendMsgBtn.classList.add('disabled');
    }
});

document.getElementById("sendMsgBtn").addEventListener("click", () => {
    const content = messageInput.value;
    sendMessage(content).then(() => {
        messageInput.value = "";
    });
});