const express = require('express');
const { check } = require('express-validator');
const {
  createStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
  updateStoreStatus
} = require('../controllers/store.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectDeveloperRoute } = require('../middleware/developerMiddleware');

const router = express.Router();

// Validation middleware
const storeValidation = [
  check('name', 'Store name is required').not().isEmpty(),
  check('location', 'Store location is required').not().isEmpty(),
  check('operatingHours.open', 'Opening time is required').not().isEmpty(),
  check('operatingHours.close', 'Closing time is required').not().isEmpty()
];

const statusValidation = [
  check('status', 'Status is required').not().isEmpty(),
  check('status', 'Invalid status value').isIn(['active', 'inactive', 'maintenance'])
];

// Apply protection to all routes
router.use(protect);

// Routes
router.route('/')
  .post([authorize('admin'), ...storeValidation], createStore)
  .get([authorize('admin', 'developer')], getStores);

router.route('/:id')
  .get([authorize('admin', 'developer')], getStore)
  .put([authorize('admin'), ...storeValidation], updateStore)
  .delete(protectDeveloperRoute, deleteStore);

router.patch('/:id/status', [authorize('admin', 'developer'), ...statusValidation], updateStoreStatus);

module.exports = router; 