const express = require('express');
const router = express.Router();
const pricingSettingsController = require('../controllers/pricingSettingsController');
const { isAdmin } = require('../middleware/auth');

// Get current pricing settings
router.get('/', pricingSettingsController.getPricingSettings);

// Update pricing settings (admin only)
router.put('/', isAdmin, pricingSettingsController.updatePricingSettings);

module.exports = router; 