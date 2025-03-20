const Message = require('../models/Message');
const User = require("../models/User")
// Send a message and notify via WebSocket
const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  if(!senderId || !receiverId || !content){
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (content === "") {
    return res.status(400).json({ error: 'Message content cannot be empty' });
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
      

    const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content
    });
    // Save the message to MongoDB
    const savedMessage = await message.save();

    // Notify the sender (confirmation that the message was sent)
    if (global.clients && global.clients.has(String(senderId))) {
        const senderSocket = global.clients.get(String(senderId));
        senderSocket.send(JSON.stringify({
            type: 'messageSent',
            data: savedMessage
        }));
    }
    // Notify the recipient if connected
    if (global.clients && global.clients.has(String(receiverId))) {
        const receiverSocket = global.clients.get(String(receiverId));
        receiverSocket.send(JSON.stringify({
            type: 'newMessage',
            data: savedMessage
        }));
    }

    res.status(200).json({ message: 'Message sent', data: savedMessage });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getConversation = async (req, res) => {
    const { friendId1, friendId2 } = req.query;
    const userId = friendId2; // Assuming requireAuth attaches the decoded token info to req.user
    console.log(userId, friendId1);
    if(!friendId1 || !friendId2)
      return res.status(400).json({ error: 'All fields are required' });
    if(friendId1 === friendId2)
      return res.status(400).json({ error: 'Cannot have a conversation with yourself' });
    
    try {
      // Retrieve all messages between the authenticated user and the specified friend
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: friendId1 },
          { sender: friendId1, receiver: userId }
        ]
      }).sort({ createdAt: 1 }); // sort in ascending order
      
      res.status(200).json({ data: messages });

    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to load conversation' });
    }
};

module.exports = { sendMessage, getConversation };
