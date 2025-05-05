const express = require('express');
const { check } = require('express-validator');
const {
  getSystemOverview,
  getStorageStatus,
  toggleMaintenanceMode
} = require('../controllers/developer.controller');
const { protectDeveloperRoute } = require('../middleware/developerMiddleware');

const router = express.Router();

// Apply developer protection to all routes
router.use(protectDeveloperRoute);

// Routes
router.get('/system', getSystemOverview);
router.get('/storage', getStorageStatus);
router.post('/maintenance', [
  check('enable', 'Enable parameter must be a boolean').isBoolean()
], toggleMaintenanceMode);

module.exports = router; 