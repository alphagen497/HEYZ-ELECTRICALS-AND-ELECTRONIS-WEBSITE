const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Use environment variable instead of hardcoded secret
const JWT_SECRET = process.env.JWT_SECRET;

const ADMIN = {
  username: 'admin',
  password: '1234' // ✅ Later, store securely or hash this
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
