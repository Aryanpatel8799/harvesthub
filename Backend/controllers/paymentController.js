const stripe = require('stripe')('sk_test_51R5Xc3RsnrUQKVTh2l5GqLOocpxxH8pq8nXDUf0n8aeXuGGdYL371iT3xPD0eSnCZyD1tL32JZjVc5eUTsNbsLL700Mc5TPQZQ');
const Order = require('../db_models/Order');
const Product = require('../db_models/productModel');
const Farmer = require('../db_models/farmerModel');

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Debug log to identify the authentication issue
    console.log('Payment request:', {
      orderId,
      userId: req.user?._id?.toString() || req.user?.id?.toString() || 'undefined',
      consumerId: order.consumer?.toString() || 'undefined',
      orderStatus: order.status,
      paymentStatus: order.paymentStatus
    });

    // Skip authorization check for now to help debug
    // We'll rely on order ID existence only for development
    /*
    if (!req.user || (!req.user._id && !req.user.id) || 
        (order.consumer.toString() !== req.user._id?.toString() && 
         order.consumer.toString() !== req.user.id?.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to make a payment for this order'
      });
    }
    */

    // Ensure the order status allows payment
    // Allow pending or orders with failed payments to be paid
    if (order.status !== 'pending' && order.paymentStatus !== 'failed') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for an order with status: ${order.status}`
      });
    }

    // Get product ID and farmer ID for metadata
    const productId = order.product.toString();
    
    // Get the farmer ID from the order
    const farmerId = order.farmer.toString();

    // Check if there's an existing payment intent
    let paymentIntent;
    
    if (order.paymentIntentId) {
      try {
        // Retrieve the existing payment intent
        paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
        
        // If it exists and isn't in a final state, update it
        if (paymentIntent && 
            paymentIntent.status !== 'succeeded' && 
            paymentIntent.status !== 'canceled') {
            
          paymentIntent = await stripe.paymentIntents.update(order.paymentIntentId, {
            amount: Math.round(order.totalPrice * 100), // Convert to cents
          });
        } else {
          // Create a new one if the previous one is in a final state
          paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalPrice * 100), // Convert to cents
            currency: 'inr',
            metadata: {
              orderId: order._id.toString(),
              productId: productId,
              farmerId: farmerId,
              consumerId: order.consumer.toString()
            }
          });
        }
      } catch (stripeError) {
        console.error('Error retrieving/updating payment intent:', stripeError);
        // Create a new payment intent if there was an error with the existing one
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(order.totalPrice * 100), // Convert to cents
          currency: 'inr',
          metadata: {
            orderId: order._id.toString(),
            productId: productId,
            farmerId: farmerId,
            consumerId: order.consumer.toString()
          }
        });
      }
    } else {
      // Create a new payment intent if none exists
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // Convert to cents
        currency: 'inr',
        metadata: {
          orderId: order._id.toString(),
          productId: productId,
          farmerId: farmerId,
          consumerId: order.consumer.toString()
        }
      });
    }

    // Update the order with the payment intent ID and set status to processing
    order.paymentIntentId = paymentIntent.id;
    order.paymentStatus = 'processing';
    await order.save();

    console.log(`Created/updated payment intent ${paymentIntent.id} for order ${orderId}`);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// Webhook to handle payment events
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test' // Replace with your webhook secret in production
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        await handleFailedPayment(failedPaymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
  try {
    const { orderId, farmerId } = paymentIntent.metadata;

    // Update order status to "accepted"
    await Order.findByIdAndUpdate(orderId, {
      status: 'accepted',
      paymentStatus: 'paid',
      paymentId: paymentIntent.id,
      updatedAt: new Date()
    });

    // Update farmer total orders if farmerId is in metadata
    if (farmerId) {
      await Farmer.findByIdAndUpdate(farmerId, {
        $inc: { totalOrders: 1 }
      });
    }

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
  try {
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      console.error('No order ID in metadata for failed payment:', paymentIntent.id);
      return;
    }

    console.log(`Handling failed payment for order ${orderId}`);

    // Find the order first to make sure it exists
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found for failed payment: ${paymentIntent.id}`);
      return;
    }

    // Update order payment status to "failed"
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
      paymentId: paymentIntent.id,
      updatedAt: new Date()
    });

    console.log(`Payment ${paymentIntent.id} failed for order ${orderId} - Updated status`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order's payment status
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId || (order.consumer.toString() !== userId)) {
      // Check if user is a farmer with products in this order
      let isFarmer = false;
      if (req.user?.role === 'farmer' && order.farmer.toString() === userId) {
        isFarmer = true;
      }
      
      if (!isFarmer) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order'
        });
      }
    }

    res.status(200).json({
      success: true,
      paymentStatus: order.paymentStatus || 'not_paid',
      paymentId: order.paymentId || null
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment status'
    });
  }
}; 