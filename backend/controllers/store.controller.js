const { validationResult } = require('express-validator');
const Store = require('../models/Store');

// @desc    Create new store
// @route   POST /api/stores
// @access  Private/Admin
exports.createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const store = await Store.create({
      ...req.body,
      adminId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: store
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: error.message
    });
  }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private/Admin
exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('adminId', 'name email');

    res.json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: error.message
    });
  }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Private/Admin
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('adminId', 'name email');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching store',
      error: error.message
    });
  }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private/Admin
exports.updateStore = async (req, res) => {
  try {
    let store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Make sure user is store admin
    if (store.adminId.toString() !== req.user._id.toString() && req.user.role !== 'developer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this store'
      });
    }

    store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating store',
      error: error.message
    });
  }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private/Developer
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    await store.deleteOne();

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting store',
      error: error.message
    });
  }
};

// @desc    Update store status
// @route   PATCH /api/stores/:id/status
// @access  Private/Admin
exports.updateStoreStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Make sure user is store admin or developer
    if (store.adminId.toString() !== req.user._id.toString() && req.user.role !== 'developer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this store'
      });
    }

    store.status = status;
    await store.save();

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating store status',
      error: error.message
    });
  }
}; 