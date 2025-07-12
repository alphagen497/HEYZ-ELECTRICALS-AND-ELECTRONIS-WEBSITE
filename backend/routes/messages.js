const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const verifyToken = require('../middleware/auth');

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
// GET /api/messages - Admin view (protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch messages.' });
  }
});
// DELETE /api/messages/:id - Delete a message
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await Message.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Message not found' });

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error("❌ Error deleting message:", err.message);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// PATCH /api/messages/:id/archive - Archive a message
router.patch('/:id/archive', verifyToken, async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Message not found' });

    res.json({ success: true, message: 'Message archived', data: updated });
  } catch (err) {
    console.error("❌ Error archiving message:", err.message);
    res.status(500).json({ error: 'Failed to archive message.' });
  }
});



module.exports = router;
