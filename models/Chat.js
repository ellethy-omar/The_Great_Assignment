const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Array of participants (usually two, but can be more for group chats)
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }],
  // Array of messages (referencing your Message model)
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  createdAt: { type: Date, default: Date.now },
  // Optional: last updated date to easily sort by recent activity
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt field automatically before each save
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
