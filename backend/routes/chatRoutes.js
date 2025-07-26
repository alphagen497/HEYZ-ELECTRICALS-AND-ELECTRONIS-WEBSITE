// chatRoutes.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// Save a message
router.post("/message", async (req, res) => {
  try {
    const { userId, message, sender } = req.body;
    const saved = await Chat.create({ userId, message, sender });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat history
router.get("/history/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.params.userId });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
