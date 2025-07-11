const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/messages
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  try {
    const newMessage = new Message({ name, email, phone, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message received' });
  } catch (err) {
    console.error("❌ Failed to save message:", err.message);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
});

module.exports = router;
