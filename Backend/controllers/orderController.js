const Order = require('../db_models/Order');
const Product = require('../db_models/productModel');
const mongoose = require('mongoose');
const { incrementTotalOrders } = require('./farmerControllers');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, farmerId, totalPrice, consumerDetails } = req.body;

    // Validate required fields
    if (!productId || !quantity || !farmerId || !totalPrice || !consumerDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate consumer details
    if (!consumerDetails.fullName || !consumerDetails.phone || !consumerDetails.address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required consumer details'
      });
    }

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const order = new Order({
      consumer: req.user.id,
      farmer: farmerId,
      product: productId,
      quantity,
      totalPrice,
      consumerDetails
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// Get orders for a consumer
exports.getConsumerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user.id })
      .populate({
        path: 'farmer',
        select: 'fullName phone'
      })
      .populate({
        path: 'product',
        select: 'name price unit'
      })
      .sort('-orderDate')
      .lean();

    // Map the orders to include farmer details in the expected structure
    const ordersWithDetails = orders.map(order => ({
      ...order,
      product: {
        ...order.product,
        farmer: {
          fullName: order.farmer?.fullName || 'Unknown',
          phone: order.farmer?.phone || 'N/A'
        }
      },
      farmer: undefined // Remove the separate farmer field
    }));

    res.status(200).json({
      success: true,
      orders: ordersWithDetails
    });
  } catch (error) {
    console.error('Get consumer orders error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// Get orders for a farmer
exports.getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate({
        path: 'product',
        select: 'name price unit'
      })
      .sort('-orderDate')
      .lean();

    // Map the orders and ensure we're using the consumerDetails from the order itself
    const ordersWithDetails = orders.map(order => ({
      ...order,
      product: order.product || { name: 'N/A', price: 0, unit: 'units' },
      consumerDetails: order.consumerDetails || {
        fullName: 'Unknown',
        phone: 'N/A',
        address: 'N/A'
      }
    }));

    res.status(200).json({
      success: true,
      orders: ordersWithDetails
    });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch orders'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, rejectionReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify that the farmer owns this order
    if (order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    if (status === 'rejected' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    // If order is completed, increment farmer's total orders
    if (status === 'completed') {
      await incrementTotalOrders(order.farmer);
    }

    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 