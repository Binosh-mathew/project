const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// GET /api/admins - List all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name email status createdAt');
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
