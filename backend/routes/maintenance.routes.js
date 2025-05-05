const express = require('express');
const router = express.Router();
const Maintenance = require('../models/maintenance.model');

// Get maintenance status
router.get('/status', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne();
    res.json({
      success: true,
      data: {
        isMaintenanceMode: maintenance ? maintenance.isMaintenanceMode : false
      }
    });
  } catch (error) {
    console.error('Error getting maintenance status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get maintenance status'
    });
  }
});

// Set maintenance mode
router.post('/set', async (req, res) => {
  try {
    const { status } = req.body;
    let maintenance = await Maintenance.findOne();
    
    if (!maintenance) {
      maintenance = new Maintenance({ isMaintenanceMode: status });
    } else {
      maintenance.isMaintenanceMode = status;
    }
    
    await maintenance.save();
    res.json({
      message: `Maintenance mode ${status ? 'enabled' : 'disabled'}`,
      isMaintenanceMode: status
    });
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to set maintenance mode'
    });
  }
});

// Reset maintenance mode
router.post('/reset', async (req, res) => {
  try {
    await Maintenance.deleteMany({});
    res.json({
      message: 'Maintenance mode reset',
      isMaintenanceMode: false
    });
  } catch (error) {
    console.error('Error resetting maintenance mode:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reset maintenance mode'
    });
  }
});

module.exports = router; 