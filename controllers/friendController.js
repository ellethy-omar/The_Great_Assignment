const FriendRequest = require('../models/Friend');
const User = require("../models/User")
// Send a friend request
const sendFriendRequest = async (req, res) => {
    const { senderId, receiverId } = req.body;
    console.log("This is sendFriendRequest",req.body);
    if(!senderId || !receiverId){
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const communicationParty = await User.find({
            _id: { $in: [senderId, receiverId] }
          });
          
            if (communicationParty.length !== 2) {
                // Check which user is missing
                if (!communicationParty.find(u => u._id.toString() === senderId)) {
                return res.status(400).json({ error: 'Sender invalid _id' });
                }
                if (!communicationParty.find(u => u._id.toString() === receiverId)) {
                return res.status(400).json({ error: 'Receiver invalid _id' });
                }
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ],
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            if (existingRequest.status === 'accepted') {
                return res.status(400).json({ error: 'Users are already friends' });
            }
            if (existingRequest.status === 'pending') {
                return res.status(400).json({ error: 'A friend request is already pending between these users' });
            }
        }

        const request = new FriendRequest({ sender: senderId, receiver: receiverId });
        const savedRequest = await request.save();
        res.status(200).json({ message: 'Friend request sent', data: savedRequest });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Server error while sending friend request' });
    }
};

const sendFriendRequestByUsername = async (req, res) => {
    const { senderId, username } = req.body;
    if (!senderId || !username) {
        return res.status(400).json({ error: 'Sender ID and username are required' });
    }

    try {
        // Find the user by username
        const receiver = await User.findOne({ username });

        if (!receiver) {
            return res.status(404).json({ error: 'User with the given username not found' });
        }

        // Use the existing sendFriendRequest logic
        const receiverId = receiver._id.toString();
        const requestBody = { senderId, receiverId };

        // Simulate a request object for sendFriendRequest
        
        req.body = requestBody;
        // console.log("This is sendFriendRequestByUsername", req.body);

        // Call the existing sendFriendRequest function
        await sendFriendRequest(req, res);
    } catch (error) {
        console.error('Error sending friend request by username:', error);
        res.status(500).json({ error: 'Server error while sending friend request by username' });
    }
};

// Accept a friend request
const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: 'Friend request not found' });
        request.status = 'accepted';
        const updatedRequest = await request.save();
        res.status(200).json({ message: 'Friend request accepted', data: updatedRequest });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Server error while accepting friend request' });
    }
};

// Decline a friend request
const declineFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: 'Friend request not found' });
        request.status = 'declined';
        const updatedRequest = await request.save();
        res.status(200).json({ message: 'Friend request declined', data: updatedRequest });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).json({ error: 'Server error while declining friend request' });
    }
};

// Retrieve pending friend requests for a user
const getPendingFriendRequests = async (req, res) => {
    const { userId } = req.params;
    try {
        const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
        .populate('sender', 'username email');
        res.status(200).json({ data: requests });
    } catch (error) {
        console.error('Error fetching pending friend requests:', error);
        res.status(500).json({ error: 'Server error while retrieving friend requests' });
    }
};

// Retrieve all friend requests (pending, accepted, declined)
const getAllFriendRequests = async (req, res) => {
    try {
      const requests = await FriendRequest.find({})
        .populate('sender receiver', 'username email'); // Populate sender and receiver details
      res.status(200).json({ data: requests });
    } catch (error) {
      console.error('Error fetching all friend requests:', error);
      res.status(500).json({ error: 'Server error while retrieving friend requests' });
    }
};    
  

// Retrieve the friends list for a user
const getFriendsList = async (req, res) => {
    const { userId } = req.params;
    try {
        const acceptedRequests = await FriendRequest.find({
            status: 'accepted',
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate('sender receiver', 'username email');
        res.status(200).json({ data: acceptedRequests });
    } catch (error) {
        console.error('Error fetching friends list:', error);
        res.status(500).json({ error: 'Server error while retrieving friends list' });
    }
};

module.exports = {
  sendFriendRequest,
  sendFriendRequestByUsername,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingFriendRequests,
  getFriendsList,
  getAllFriendRequests
};


/*
    TestingAPI users
    "userA": {
        "username": "testuserA",
        "email": "testusera@example.com",
        "password": "$2b$10$gOY7qO1ojgnPaiGXpAl4uutikPg/crpZt77NFhbijGdEzYdMavlQi",
        "_id": "67db21611d3050d0817c6263",
        "createdAt": "2025-03-19T19:56:17.107Z",
        "__v": 0
    },
    "userB": {
        "username": "testuserB",
        "email": "testuserb@example.com",
        "password": "$2b$10$vEaObdQk/91G9VpifJrXvuTWXIqtYAQm7zsysfmwpOpbddqXClcsG",
        "_id": "67db21abdd5cd55384cd584f",
        "createdAt": "2025-03-19T19:57:31.281Z",
        "__v": 0
    },
    "userC": {
        "username": "testuserC",
        "email": "testuserc@example.com",
        "password": "$2b$10$dxjXHPJ03JkHQ54kv9ONqeDN2j3JL7h3d9/4MxHzK/Xx8rV6NEDFS",
        "_id": "67db26f5e85dc0ac133e6614",
        "createdAt": "2025-03-19T20:20:05.931Z",
        "__v": 0
    }
*/