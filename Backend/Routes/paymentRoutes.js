const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, consumerOnly } = require('../Middleware/authMiddleware');

// Route to create a payment intent (for initiating payments)
router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);

// Route to handle Stripe webhooks
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

// Route to get payment status for an order
router.get('/status/:orderId', auth, paymentController.getPaymentStatus);

module.exports = router; 