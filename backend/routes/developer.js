const express = require('express');
const router = express.Router();
const { protectDeveloperRoute } = require('../middleware/developerMiddleware');
const developerController = require('../controllers/developer.controller');

// Protect all routes in this router
router.use(protectDeveloperRoute);

// @route   GET /api/developer/system
// @desc    Get system overview
// @access  Private/Developer
router.get('/system', developerController.getSystemOverview);

// @route   GET /api/developer/storage
// @desc    Get storage status
// @access  Private/Developer
router.get('/storage', developerController.getStorageStatus);

// @route   POST /api/developer/maintenance
// @desc    Toggle maintenance mode
// @access  Private/Developer
router.post('/maintenance', developerController.toggleMaintenanceMode);

module.exports = router; 