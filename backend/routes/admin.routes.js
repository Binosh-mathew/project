const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/admins - List all admins (developer only)
router.get('/', protect, authorize('developer'), async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name email storeId status createdAt');
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
