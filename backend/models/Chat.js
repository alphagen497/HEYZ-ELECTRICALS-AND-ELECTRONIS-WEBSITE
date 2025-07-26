// models/Chat.js
const mongoose = require("mongoose");
module.exports = mongoose.model("Chat", new mongoose.Schema({
  userId: String,
  message: String,
  sender: String, // 'customer', 'ai', 'assistant'
  timestamp: { type: Date, default: Date.now }
}));
