const Order = require('../db_models/Order');
const Product = require('../db_models/productModel');
const mongoose = require('mongoose');
const Farmer = require('../db_models/farmerModel');

// Helper function to increment total orders
const incrementTotalOrders = async (farmerId, productId) => {
  try {
    // Increment farmer's total orders
    await Farmer.findByIdAndUpdate(farmerId, {
      $inc: { totalOrders: 1 }
    });

    // Increment product's total orders
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalOrders: 1 }
    });
  } catch (error) {
    console.error('Error incrementing total orders:', error);
    throw error;
  }
};

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

    // Get user ID - handle both possible formats
    const consumerId = req.user._id || req.user.id;
    if (!consumerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const order = new Order({
      consumer: consumerId,
      farmer: farmerId,
      product: productId,
      quantity,
      totalPrice,
      consumerDetails
    });

    await order.save();
    
    // Increment the total orders count for this farmer
    await Farmer.findByIdAndUpdate(farmerId, {
      $inc: { totalOrders: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order // Use 'order' directly for consistent frontend access
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
      .sort('-createdAt')
      .lean();

    // Map the orders to include farmer details and formatted dates
    const ordersWithDetails = orders.map(order => ({
      ...order,
      product: {
        ...order.product,
        farmer: {
          fullName: order.farmer?.fullName || 'Unknown',
          phone: order.farmer?.phone || 'N/A'
        }
      },
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
      formattedCreatedAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      formattedUpdatedAt: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A',
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
      .sort('-createdAt')
      .lean();

    // Map the orders and ensure we're using the consumerDetails and formatted dates
    const ordersWithDetails = orders.map(order => ({
      ...order,
      product: order.product || { name: 'N/A', price: 0, unit: 'units' },
      consumerDetails: order.consumerDetails || {
        fullName: 'Unknown',
        phone: 'N/A',
        address: 'N/A'
      },
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
      formattedCreatedAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      formattedUpdatedAt: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'
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

    console.log('Updating order status:', {
      orderId,
      status,
      userId: req.user.id,
      userType: req.user.type
    });

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    console.log('Order found:', {
      orderFarmerId: order.farmer.toString(),
      requestUserId: req.user.id,
      isMatch: order.farmer.toString() === req.user.id
    });

    // Verify that the farmer owns this order
    if (!req.user.id || req.user.type !== 'farmer') {
      return res.status(403).json({ 
        success: false,
        message: 'Only farmers can update order status' 
      });
    }

    if (order.farmer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this order' 
      });
    }

    // Check if the order is already in the requested status
    if (order.status === status) {
      return res.status(400).json({ 
        success: false,
        message: `Order is already ${status}` 
      });
    }

    // Store previous status before updating
    const previousStatus = order.status;

    // Update order status
    order.status = status;
    if (status === 'rejected' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    // If order status is changing to rejected or cancelled from another status
    if ((status === 'rejected' || status === 'cancelled') && previousStatus !== 'rejected' && previousStatus !== 'cancelled') {
      // Decrement the farmer's total orders count
      await Farmer.findByIdAndUpdate(order.farmer, {
        $inc: { totalOrders: -1 }
      });
    }

    await order.save();

    // Fetch the updated order with populated fields
    const updatedOrder = await Order.findById(orderId)
      .populate({
        path: 'product',
        select: 'name price unit totalOrders'
      })
      .populate({
        path: 'farmer',
        select: 'fullName totalOrders'
      })
      .lean();

    // Add formatted dates to the response
    const orderWithDates = {
      ...updatedOrder,
      createdAt: updatedOrder.createdAt ? new Date(updatedOrder.createdAt).toISOString() : null,
      updatedAt: updatedOrder.updatedAt ? new Date(updatedOrder.updatedAt).toISOString() : null,
      formattedCreatedAt: updatedOrder.createdAt ? new Date(updatedOrder.createdAt).toLocaleDateString() : 'N/A',
      formattedUpdatedAt: updatedOrder.updatedAt ? new Date(updatedOrder.updatedAt).toLocaleDateString() : 'N/A'
    };

    console.log('Order status updated successfully:', {
      orderId,
      newStatus: status,
      updatedOrder: orderWithDates._id
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: orderWithDates
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating order status'
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order by ID and populate product details
    const order = await Order.findById(id)
      .populate({
        path: 'product',
        select: 'name price imageUrl farmerId'
      })
      .populate({
        path: 'farmer',
        select: 'fullName phone location'
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get the user ID from either _id or id
    const userId = req.user._id?.toString() || req.user.id?.toString();
    
    // Check if user is the consumer who placed the order
    const isConsumer = order.consumer.toString() === userId;
    
    // Check if user is the farmer who received it
    const isFarmer = req.user.type === 'farmer' && order.farmer.toString() === userId;
    
    console.log('Order access check:', { 
      userId, 
      consumer: order.consumer.toString(), 
      farmer: order.farmer.toString(),
      userType: req.user.type,
      isConsumer,
      isFarmer
    });
    
    if (!isConsumer && !isFarmer) {
      return res.status(403).json({ message: 'You are not authorized to view this order' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 