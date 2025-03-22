const express = require('express');
const router = express.Router();
const { auth, consumerOnly, farmerOnly } = require('../Middleware/authMiddleware');
const {
  createOrder,
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// Consumer routes
router.post('/', auth, consumerOnly, createOrder);
router.get('/consumer', auth, consumerOnly, getConsumerOrders);

// Farmer routes
router.get('/farmer', auth, farmerOnly, getFarmerOrders);
router.put('/:orderId/status', auth, farmerOnly, updateOrderStatus);

module.exports = router; 