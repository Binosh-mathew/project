const express = require('express');
const { check } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getRevenueByStore,
  getOrdersPerStorePerMonth,
  getMostActiveUsers
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const { protectDeveloperRoute } = require('../middleware/developerMiddleware');

const router = express.Router();

// Validation middleware
const orderValidation = [
  check('storeId', 'Store ID is required').not().isEmpty(),
  check('items', 'Items are required').isArray({ min: 1 }),
  check('items.*.name', 'Item name is required').not().isEmpty(),
  check('items.*.quantity', 'Item quantity is required').isInt({ min: 1 }),
  check('items.*.price', 'Item price is required').isFloat({ min: 0 }),
  check('totalAmount', 'Total amount is required').isFloat({ min: 0 })
];

const statusValidation = [
  check('status', 'Status is required').not().isEmpty(),
  check('status', 'Invalid status value').isIn(['pending', 'processing', 'completed', 'cancelled'])
];

// Apply protection to all routes
router.use(protect);

// Routes
router.route('/')
  .post([authorize('user'), ...orderValidation], createOrder)
  .get(authorize('user', 'admin', 'developer'), getOrders);

router.route('/stats')
  .get(protectDeveloperRoute, getOrderStats);

router.route('/:id')
  .get(authorize('user', 'admin', 'developer'), getOrder);

router.patch('/:id/status', [authorize('admin'), ...statusValidation], updateOrderStatus);

router.get('/revenue-by-store', authorize('developer'), getRevenueByStore);
router.get('/orders-per-store-per-month', authorize('developer'), getOrdersPerStorePerMonth);
router.get('/most-active-users', authorize('developer'), getMostActiveUsers);

module.exports = router; 