const jwt = require("jsonwebtoken");
require('dotenv').config();
const Message  = require('../models/Message');
// Global map to store connected clients per conversation
// Example structure: { conversationId: Set of ws clients }
if (!global.clients) {
    global.clients = new Map();
}
  
const WebSocketRoutes = (ws, request) => {
    // Parse the URL to extract query parameters
    const urlObj = new URL(request.url, `http://${request.headers.host}`);
    const path = urlObj.pathname;
    const token = urlObj.searchParams.get("token");
    const conversationId = urlObj.searchParams.get("conversationId");

    // Protect routes: require a valid token for all protected paths (e.g., /chat)
    if (!token) {
        console.log("No token provided, closing connection.");
        ws.close(1008, 'Authorization token required');
        return;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("JWT verification error:", error.message);
        ws.close(1008, 'Invalid or expired token');
        return;
    }

    // You can attach the decoded user info to the ws object for later use
    ws.user = decoded;

    // Handling based on path
    switch (path) {
        case '/':
        global.clients.set(String(decoded.ID), ws);
        // console.log(`Lobby client connected: User ${decoded.ID}`);
        ws.send(JSON.stringify({ message: "Welcome to the lobby!" }));
        break;
        case '/chat':
            console.log('Chat client connected');
            break;
        break;
        case '/alerts':
            console.log('Alerts client connected');
            ws.send(JSON.stringify({ message: 'You are now subscribed to alerts!' }));
            break;
        default:
            console.log(`Unknown path: ${path}`);
            ws.close(1000, 'Invalid path'); // Close the socket gracefully
            return;
    }

    // Generic message handler
    ws.on('message', async (message) => {
        let parsed;
        try {
          parsed = JSON.parse(message);
        } catch (error) {
          console.error('Error parsing message:', error);
          return;
        }
        
        switch (parsed.type) {
          case 'markAsRead':
            const { chatId, messageIds, readAt } = parsed.data;
            console.log(`Marking messages as read in chat ${chatId} for messages:`, messageIds);
            
            try {
                // Update the messages in your database that match the provided IDs
                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $set: { readAt: readAt } }
                );

                const messages = await Message.find({ _id: { $in: messageIds } });
                const senderIds = [...new Set(messages.map(msg => msg.sender.toString()))];
                
                ws.send(JSON.stringify({
                    type: 'markAsReadAck',
                    data: { chatId, messageIds, readAt }
                }));

                senderIds.forEach(senderId => {
                    if (global.clients && global.clients.has(String(senderId))) {
                    const senderSocket = global.clients.get(String(senderId));
                    senderSocket.send(JSON.stringify({
                        type: 'markAsRead',
                        data: { chatId, messageIds, readAt }
                    }));
                    }
                });
            } catch (err) {
              console.error('Error updating messages as read:', err);
            }
            
            break;
            
          // Handle other message types...
          default:
            console.log(`Unhandled message type: ${parsed.type}`);
        }
    });
      

    // Clean up on close
    ws.on('close', () => {
        console.log(`User ${decoded.ID} disconnected from conversation ${conversationId}`);
    });
};

module.exports = {
  WebSocketRoutes
};
