function initWebSocket() {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:4123/?token=${encodeURIComponent(token)}`);  
  
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };
  
    ws.onmessage = (event) => {
      console.log('Received:', event.data);
      // setTimeout(()=> {
      //   ws.close(1000, "Testing");
      // }, 5000)
    };
  
    ws.onclose = (event) => {
      console.log('Disconnected:', event.data);
      // Attempt to reconnect after 5 seconds
      setTimeout(initWebSocket, 5000);
    };
  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return ws;
}
  
// Initialize the connection
const ws = initWebSocket();
  
