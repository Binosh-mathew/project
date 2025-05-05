const express = require('express');
const router = express.Router();

// Simple in-memory message model for demo (replace with Mongoose if you want persistence)
const Message = require('../models/message.model'); // We'll create this next

// GET /api/messages - List all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/messages - Add a new message
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.create({ text, createdAt: new Date() });
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
