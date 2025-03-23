function initWebSocket() {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:4123/?token=${encodeURIComponent(token)}`);  
  
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      
      if (data.type === 'newMessage') {
        const chatId = data.chatId;
        const message = data.data;
        console.log('New message in chat:', chatId, message);
        
        if (activeChat && activeChat.chatId === chatId) {
          loadChat(chatId);
          removeNotificationForChat(chatId);
        } else {
          showNotificationForChat(chatId);
        }
      }

      if (data.type === "markAsRead" || data.type === "markAsReadAck") {
        const { chatId, readAt } = data.data;
        if (activeChat && activeChat.chatId === chatId) {
          loadChat(chatId);
        }
      }

      if(data.type === "isTyping") {
        console.log(data.data);
        isTypingIndicator(data.data.chatId, data.data.isTyping);
      }
    };
    
    ws.onclose = (event) => {
      console.log('Disconnected:', event.data);
      setTimeout(initWebSocket, 5000);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return ws;
}
  
// Initialize the connection
const ws = initWebSocket();
  
