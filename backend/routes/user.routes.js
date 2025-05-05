const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const Admin = require('../models/Admin');

// GET /api/users - List all users (admin/developer only)
router.get('/', protect, authorize('admin', 'developer'), async (req, res) => {
  try {
    // Only return users who are NOT admins
    const users = await User.find({ role: { $ne: 'admin' } }, 'name email role status createdAt');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/admins - List all admin users
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, 'name email role status createdAt');
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
