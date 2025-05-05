const Order = require('../models/Order');
const Store = require('../models/Store');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    const now = new Date();
    let startDate;

    switch (range) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get daily orders and revenue
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get orders by type
    const ordersByType = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average processing time
    const avgProcessingTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: { $subtract: ['$completedAt', '$createdAt'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        dailyOrders: dailyOrders.map(d => ({
          date: d._id,
          orders: d.count,
          revenue: d.revenue
        })),
        ordersByType: ordersByType.reduce((acc, curr) => ({
          ...acc,
          [curr._id]: curr.count
        }), {}),
        ordersByStatus: ordersByStatus.reduce((acc, curr) => ({
          ...acc,
          [curr._id]: curr.count
        }), {}),
        averageProcessingTime: avgProcessingTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
}; 