const Chat = require('../models/Chat');
const Message = require('../models/Message');


// Create a new chat between users
const createChat = async (req, res) => {
  try {
    const { participants } = req.body; // expect an array of user IDs

    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'A chat must have at least two participants.' });
    }

    // Optionally, check if a chat between these users already exists
    let chat = await Chat.findOne({ participants: { $all: participants } });
    if (chat) {
      return res.status(200).json(chat);
    }

    chat = new Chat({ participants });
    await chat.save();

    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve a chat by its ID (populating participants and messages)
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    if(!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }
    const chat = await Chat.findById(chatId)
      .populate('participants', 'username email')
      .populate({
        path: 'messages',
        populate: { path: 'sender receiver', select: 'username email' }
      });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a new message to a chat
const addMessageToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, receiver, content } = req.body;

    if(!chatId || !sender || !receiver || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create and save the new message
    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    // Update the chat with the new message
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { 
        $push: { messages: newMessage._id },
        updatedAt: Date.now()
      },
      { new: true }
    ).populate({
      path: 'messages',
      populate: { path: 'sender receiver', select: 'username email' }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all chats for a specific user
const getChatsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    if(!userId)
      return res.status(400).json({ error: 'User ID is required' });

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username email')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: 1 } }, // messages sorted oldest to newest
        populate: { path: 'sender receiver', select: 'username email' }
      })
      .sort({ updatedAt: -1 }); // sort chats by recent activity

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chats for user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    createChat,
    getChatById,
    addMessageToChat,
    getChatsByUser
}




/*
const FriendRequest = require('../models/Friend');
const createChatsForAcceptedRequests = async () => {
  try {
    // Find all friend requests that have been accepted
    const acceptedRequests = await FriendRequest.find({ status: 'accepted' });
    console.log(`Found ${acceptedRequests.length} accepted friend requests`);

    // Loop through each accepted friend request
    for (const request of acceptedRequests) {
      const participants = [request.sender, request.receiver];

      // Check if a chat already exists between these two users
      const existingChat = await Chat.findOne({
        participants: { $all: participants }
      });

      if (!existingChat) {
        // Create a new chat if one does not exist
        const newChat = new Chat({ participants });
        await newChat.save();
        console.log(`Created chat for friend request: ${request._id}`);
      } else {
        console.log(`Chat already exists for friend request: ${request._id}`);
      }
    }

    console.log('Chat creation for accepted friend requests complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating chats for accepted friend requests:', error);
    process.exit(1);
  }
};
*/
// createChatsForAcceptedRequests();
