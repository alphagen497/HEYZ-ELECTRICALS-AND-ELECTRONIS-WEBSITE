const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ADMIN = {
  username: 'admin',
  password: '1234' // ✅ change to hashed DB check later
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
