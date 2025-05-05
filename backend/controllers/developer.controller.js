const Store = require('../models/Store');
const Order = require('../models/Order');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// @desc    Get system overview
// @route   GET /api/developer/system
// @access  Private/Developer
exports.getSystemOverview = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ status: 'active' });
    const maintenanceStores = await Store.countDocuments({ status: 'maintenance' });
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay }
    });

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
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
        stores: {
          total: totalStores,
          active: activeStores,
          maintenance: maintenanceStores
        },
        orders: {
          today: dailyOrders
        },
        revenue: {
          monthly: monthlyRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system overview',
      error: error.message
    });
  }
};

// @desc    Get storage status
// @route   GET /api/developer/storage
// @access  Private/Developer
exports.getStorageStatus = async (req, res) => {
  try {
    let command;
    if (process.platform === 'win32') {
      command = 'wmic logicaldisk get size,freespace,caption';
    } else {
      command = 'df -h /';
    }

    const { stdout } = await execAsync(command);
    let storage = { total: 0, free: 0, used: 0 };

    if (process.platform === 'win32') {
      const lines = stdout.trim().split('\n').slice(1);
      for (const line of lines) {
        const [caption, freeSpace, size] = line.trim().split(/\s+/);
        if (caption === 'C:') {
          storage.total = Math.floor(parseInt(size) / (1024 * 1024 * 1024)); // Convert to GB
          storage.free = Math.floor(parseInt(freeSpace) / (1024 * 1024 * 1024));
          storage.used = storage.total - storage.free;
          break;
        }
      }
    } else {
      const line = stdout.trim().split('\n')[1];
      const [, size, used, available] = line.trim().split(/\s+/);
      storage.total = parseInt(size.replace('G', ''));
      storage.used = parseInt(used.replace('G', ''));
      storage.free = parseInt(available.replace('G', ''));
    }

    storage.warning = (storage.free / storage.total) < 0.1;

    // Get MongoDB storage info
    const dbStats = await Store.db.stats();
    const dbSizeGB = Math.floor(dbStats.dataSize / (1024 * 1024 * 1024));

    res.json({
      success: true,
      data: {
        system: storage,
        database: {
          size: dbSizeGB,
          collections: dbStats.collections,
          indexes: dbStats.indexes
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching storage status',
      error: error.message
    });
  }
};

// @desc    Toggle maintenance mode for all stores
// @route   POST /api/developer/maintenance
// @access  Private/Developer
exports.toggleMaintenanceMode = async (req, res) => {
  try {
    const { enable } = req.body;

    if (typeof enable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Enable parameter must be a boolean'
      });
    }

    const result = await Store.updateMany(
      { status: enable ? 'active' : 'maintenance' },
      { status: enable ? 'maintenance' : 'active' }
    );

    res.json({
      success: true,
      message: `Maintenance mode ${enable ? 'enabled' : 'disabled'} for all stores`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling maintenance mode',
      error: error.message
    });
  }
}; 