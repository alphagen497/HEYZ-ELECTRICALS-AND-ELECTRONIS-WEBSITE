const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const verifyToken = require('../middleware/auth');
const nodemailer = require("nodemailer");

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/messages - Public
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format.' });
  }

  try {
    const newMessage = new Message({ name, email, phone, message, createdAt: new Date() });
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

// POST /api/messages/reply - Admin reply via email
router.post("/reply", verifyToken, async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Missing recipient email or message content." });
  }

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: "Message content cannot be empty." });
  }

  try {
    await transporter.sendMail({
      from: `"HEYZ Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject || "Reply from HEYZ Support",
      html: `<p>${message}</p>`,
    });

    console.log(`✉️ Reply sent to: ${to} | Subject: ${subject}`);
    res.json({ message: "Reply sent successfully." });
  } catch (error) {
    console.error("❌ Email send error:", error);
    res.status(500).json({ error: "Failed to send reply." });
  }
});

module.exports = router;
