const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Store = require('../models/Store');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if store exists and is active
    const store = await Store.findById(req.body.storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    if (store.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Store is not currently active'
      });
    }

    const order = await Order.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query;

    // If user is admin, only get orders for their store
    if (req.user.role === 'admin') {
      query = Order.find({ storeId: req.user.storeId });
    }
    // If user is regular user, only get their orders
    else if (req.user.role === 'user') {
      query = Order.find({ userId: req.user._id });
    }
    // If developer, get all orders
    else {
      query = Order.find();
    }

    const orders = await query
      .populate('userId', 'name email')
      .populate('storeId', 'name location');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('storeId', 'name location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user has access to this order
    if (
      req.user.role === 'user' && order.userId.toString() !== req.user._id.toString() ||
      req.user.role === 'admin' && order.storeId.toString() !== req.user.storeId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure admin owns the store
    if (req.user.role === 'admin' && order.storeId.toString() !== req.user.storeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Developer
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const dailyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailyOrders,
        monthlyOrders,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
};

// @route GET /api/orders/revenue-by-store
// @access Private/Developer
exports.getRevenueByStore = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      { $group: { _id: '$storeId', totalRevenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $lookup: { from: 'stores', localField: '_id', foreignField: '_id', as: 'store' } },
      { $unwind: '$store' },
      { $project: { storeName: '$store.name', totalRevenue: 1, orderCount: 1 } }
    ]);
    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/orders-per-store-per-month
// @access Private/Developer
exports.getOrdersPerStorePerMonth = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: {
            storeId: '$storeId',
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'stores',
          localField: '_id.storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      { $unwind: '$store' },
      {
        $project: {
          storeName: '$store.name',
          month: '$_id.month',
          year: '$_id.year',
          orderCount: 1
        }
      }
    ]);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/most-active-users
// @access Private/Developer
exports.getMostActiveUsers = async (req, res) => {
  try {
    const users = await Order.aggregate([
      { $group: { _id: '$userId', orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', email: '$user.email', orderCount: 1 } }
    ]);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 