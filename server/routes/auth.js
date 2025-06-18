const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Harsh@11' && password === '12345') {
    return res.json({ message: 'Login successful' });
  }
  return res.status(400).json({ error: 'Invalid credentials' });
});

module.exports = router;