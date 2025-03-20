// WebSockets/MainWebSocket.js
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Global map to store connected clients per conversation
// Example structure: { conversationId: Set of ws clients }
if (!global.conversations) {
    global.conversations = new Map();
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
        console.log('Normal client connected');
        ws.send(JSON.stringify({ message: 'Welcome to the lobby!' }));
        break;
        case '/chat':
        if (!conversationId) {
            console.log("Chat connection attempted without a conversationId.");
            ws.close(1008, 'Conversation ID required');
            return;
        }
        console.log(`Chat client connected to conversation ${conversationId} by user ${decoded.ID}`);
        ws.send(JSON.stringify({ message: `Welcome to conversation ${conversationId}!` }));
        
        // Add ws client to a conversation-specific set
        if (!global.conversations.has(conversationId)) {
            global.conversations.set(conversationId, new Set());
        }
        global.conversations.get(conversationId).add(ws);

        // Clean up on close
        ws.on('close', () => {
            console.log(`User ${decoded.ID} disconnected from conversation ${conversationId}`);
            const clients = global.conversations.get(conversationId);
            if (clients) {
                clients.delete(ws);
                if (clients.size === 0) {
                    global.conversations.delete(conversationId);
                }
            }
        });
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
    ws.on('message', (message) => {
        console.log(`Received on ${path}: ${message}`);
        // For example, if the path is /chat, you might want to broadcast to all clients in that conversation:
        if (path === '/chat' && conversationId) {
        const clients = global.conversations.get(conversationId);
        if (clients) {
            // Broadcast message to all clients in the same conversation (except the sender, if desired)
            clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                type: 'chatMessage',
                data: {
                    from: decoded.ID,
                    message: message,
                    conversationId: conversationId
                }
                }));
            }
            });
        }
        } else {
        // For other paths, simply echo back the message
        ws.send(JSON.stringify({ echo: message }));
        }
    });
};

module.exports = {
  WebSocketRoutes
};
