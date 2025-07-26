const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET;
const { verifyToken, isAdmin } = require('../middleware/auth');


router.get('/verify', verifyToken, (req, res) => {
  res.json({ message: 'Token valid' });
});


// Register admin
router.post('/register', async (req, res) => {
  const { username, password, secret } = req.body;

  console.log("📥 Incoming registration:", req.body);

  if (secret !== process.env.REGISTER_SECRET) {
    console.warn("❌ Invalid registration secret used");
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    // Check if username already exists
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashed });
    await admin.save();

    console.log("✅ Admin registered:", username);
    res.json({ message: 'Admin registered successfully' });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: 'Failed to register admin' });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/reset-password', async (req, res) => {
  const { username, newPassword, secret } = req.body;

  if (secret !== process.env.REGISTER_SECRET) {
    return res.status(403).json({ message: "Invalid reset secret" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await Admin.findOneAndUpdate(
      { username },
      { password: hashed },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/admin/data', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Admin content visible only to verified admins' });
});



module.exports = router;
