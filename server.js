// server.js

// Import required modules
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
require('dotenv').config()
const connectDB = require('./config/db');

connectDB();
// Create an Express application
const app = express();

// Middleware for JSON and URL-encoded form data parsing
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'register', 'register.html'));
});

// Register The big API container
const integrationRoutes = require('./routes/integrationRouter')
app.use('/api', integrationRoutes);

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chat', 'chat.html'));
});

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize the WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// Import the WebSocketRoutes function from your WebSocket module
const { WebSocketRoutes } = require('./websockets/mainWebsocket');

// Set up the connection event for WebSocket
wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection established');
  WebSocketRoutes(ws, request);
});


app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});


// Define the port and start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server for webosockets and http requests is running on port ${PORT}`);
});
