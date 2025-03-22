const express = require('express');
const router = express.Router();
const { auth, consumerOnly, farmerOnly } = require('../Middleware/authMiddleware');
const {
  createOrder,
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus,
  getOrderById
} = require('../controllers/orderController');

// Consumer routes
router.post('/', auth, consumerOnly, createOrder);
router.get('/consumer', auth, consumerOnly, getConsumerOrders);

// Farmer routes
router.get('/farmer', auth, farmerOnly, getFarmerOrders);
router.put('/:orderId/status', auth, farmerOnly, updateOrderStatus);

// Get a single order by ID - accessible by the order owner (consumer) or the farmer
router.get('/:id', auth, getOrderById);

module.exports = router; 