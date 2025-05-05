const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { isAdmin } = require('../middleware/auth');

// Get analytics data
router.get('/', isAdmin, analyticsController.getAnalytics);

module.exports = router; 