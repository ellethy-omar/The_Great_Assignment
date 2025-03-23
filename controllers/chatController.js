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
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Retrieve the chat with populated messages and participants
    const chat = await Chat.findById(chatId)
      .populate('participants', 'username email')
      .populate({
        path: 'messages',
        populate: { path: 'sender receiver', select: 'username email' }
      });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Assume authenticated user is added to req.user by middleware
    const currentUserId = req.user._id;

    // Filter unread messages for current user
    const unreadMessages = chat.messages.filter(message => {
      return String(message.receiver._id) === String(currentUserId) && !message.readAt;
    });

    // If there are unread messages, update their readAt field in the database.
    if (unreadMessages.length > 0) {
      const unreadMessageIds = unreadMessages.map(msg => msg._id);
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $set: { readAt: new Date() } }
      );

      // Notify each sender that their message(s) have been read
      const senderIds = [...new Set(unreadMessages.map(msg => msg.sender._id.toString()))];
      senderIds.forEach(senderId => {
        if (global.clients && global.clients.has(String(senderId))) {
          const senderSocket = global.clients.get(String(senderId));
          const now = new Date();
          // then use it in the message:
          senderSocket.send(JSON.stringify({
              type: "markAsRead",
              data: { chatId, readAt: now }
          }));
        }
      });
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

    if (!chatId || !sender || !receiver || !content) {
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

    // console.log(global);

    // After saving the message in your HTTP handler:
    if (global.clients && global.clients.has(String(receiver))) {
      const receiverSocket = global.clients.get(String(receiver));
      receiverSocket.send(
        JSON.stringify({
          type: "newMessage",
          data: newMessage, // your saved message object
          chatId
        })
      );
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('Error adding message to chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const currentUserId = req.user._id; // assuming you have authentication middleware

  try {
    // Update all messages in this chat that were sent to the user and are not yet read
    const result = await Message.updateMany(
      { _id: { $in: chat.messages }, receiver: currentUserId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    
    // Optionally, fetch updated messages and return them
    res.status(200).json({ message: 'Messages marked as read', result });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error while marking messages as read' });
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
