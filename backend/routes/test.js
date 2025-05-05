const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date() });
});

module.exports = router; 