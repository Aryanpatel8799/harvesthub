const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../Middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { body } = require('express-validator');
const User = require('../db_models/User');
const Order = require('../db_models/Order');
const SoilCertification = require('../db_models/SoilCertification');

// Public routes
router.post('/login', [
  body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).trim().withMessage('Password must be at least 6 characters long')
], adminController.login);

// Protected routes
router.post('/register', auth, adminOnly, [
  body('fullName').isLength({ min: 2 }).trim().withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).trim().withMessage('Password must be at least 6 characters long')
], adminController.registerAdmin);

router.post('/logout', auth, adminOnly, adminController.logout);

// Get dashboard statistics
router.get('/dashboard/stats', auth, adminOnly, async (req, res) => {
  try {
    console.log('Fetching admin dashboard statistics...');

    // Get total farmers count
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    console.log('Total farmers:', totalFarmers);

    // Get total consumers count
    const totalConsumers = await User.countDocuments({ role: 'consumer' });
    console.log('Total consumers:', totalConsumers);

    // Get orders statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Process order stats
    const orderSummary = {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0
    };

    orderStats.forEach(stat => {
      orderSummary.total += stat.count;
      orderSummary.totalRevenue += stat.totalAmount || 0;
      if (stat._id === 'pending') orderSummary.pending = stat.count;
      if (stat._id === 'completed') orderSummary.completed = stat.count;
      if (stat._id === 'cancelled') orderSummary.cancelled = stat.count;
    });

    // Get certification counts by status
    const certificationStats = await SoilCertification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform certification stats
    const stats = {
      totalFarmers,
      totalConsumers,
      totalOrders: orderSummary.total,
      totalRevenue: orderSummary.totalRevenue,
      orders: {
        total: orderSummary.total,
        pending: orderSummary.pending,
        completed: orderSummary.completed,
        cancelled: orderSummary.cancelled
      },
      pendingCertifications: 0,
      approvedCertifications: 0,
      rejectedCertifications: 0
    };

    certificationStats.forEach(stat => {
      if (stat._id === 'pending') stats.pendingCertifications = stat.count;
      if (stat._id === 'approved') stats.approvedCertifications = stat.count;
      if (stat._id === 'rejected') stats.rejectedCertifications = stat.count;
    });

    console.log('Dashboard stats:', stats);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.'
    });
  }
});

// Get orders by status
router.get('/orders/by-status', auth, adminOnly, async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    res.json(ordersByStatus);
  } catch (error) {
    console.error('Error getting orders by status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly orders
router.get('/orders/monthly', auth, adminOnly, async (req, res) => {
  try {
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);
    res.json(monthlyOrders);
  } catch (error) {
    console.error('Error getting monthly orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 