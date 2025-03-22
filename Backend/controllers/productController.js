const Product = require('../db_models/productModel');
const path = require('path');
const fs = require('fs');

// Get all products with filters
exports.getAllProducts = async (req, res) => {
  try {
    console.log('Fetching products with query:', req.query);
    
    const {
      category,
      organic,
      rental,
      minPrice,
      maxPrice,
      location,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let query = {};

    // Apply filters
    if (category) query.category = category;
    if (organic) query.organic = organic === 'true';
    if (rental) query.rental = rental === 'true';
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));

    try {
      // Count total documents for pagination
      const total = await Product.countDocuments(query);
      console.log('Total products found:', total);

      // Execute main query with pagination
      const products = await Product.find(query)
        .populate('farmer', 'fullName location')  // Simplified populate
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      console.log(`Found ${products.length} products for current page`);
      
      // Transform products to plain objects and handle any virtual fields
      const transformedProducts = products.map(product => {
        const plainProduct = product.toObject();
        // Add any computed fields here if needed
        return plainProduct;
      });

      res.status(200).json({
        success: true,
        products: transformedProducts,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'fullName location email phone')
      .populate('reviews.user', 'fullName');
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product',
      error: error.message 
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Files received:', req.files);
    console.log('Product images:', req.productImages);
    console.log('Farm images:', req.farmImages);
    console.log('User data:', req.user);

    // Check if user is authenticated and is a farmer
    if (!req.user || !req.user.id) {
      throw new Error('User not authenticated');
    }

    const productData = {
      ...req.body,
      farmer: req.user.id,
      images: req.productImages || [],
      farmImages: req.farmImages || []
    };

    // Convert string values to appropriate types
    if (productData.price) productData.price = Number(productData.price);
    if (productData.rentalPrice) productData.rentalPrice = Number(productData.rentalPrice);
    if (productData.organic) productData.organic = productData.organic === 'true';
    if (productData.rental) productData.rental = productData.rental === 'true';

    console.log('Final product data:', productData);

    const product = new Product(productData);
    
    // Calculate initial discount based on expiry date
    product.calculateCurrentDiscount();
    
    await product.save();
    
    console.log('Product saved successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ 
      message: 'Failed to create product',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('User:', req.user);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check if the user is the owner of the product
    if (product.farmer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    // Add image URLs if present
    if (req.productImages) {
      req.body.images = req.productImages;
    }
    if (req.farmImages) {
      req.body.farmImages = req.farmImages;
    }

    // Convert string values to appropriate types
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.rentalPrice) req.body.rentalPrice = Number(req.body.rentalPrice);
    if (req.body.organic) req.body.organic = req.body.organic === 'true';
    if (req.body.rental) req.body.rental = req.body.rental === 'true';

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'price', 'unit', 'category',
      'organic', 'rental', 'rentalPrice', 'rentalUnit',
      'location', 'images', 'farmImages', 'expiryDate'
    ];

    allowedUpdates.forEach(update => {
      if (req.body[update] !== undefined) {
        product[update] = req.body[update];
      }
    });

    // Recalculate discount if expiry date is updated
    product.calculateCurrentDiscount();
    
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('Delete request - Product ID:', req.params.id);
    console.log('User:', req.user);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    console.log('Product farmer ID:', product.farmer);
    console.log('User ID:', req.user.id);

    // Check if the user is the owner of the product
    const productFarmerId = product.farmer.toString();
    const userId = req.user.id.toString();

    console.log('Comparing IDs:', { productFarmerId, userId });

    if (productFarmerId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product',
      error: error.message 
    });
  }
};

// Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure the user is a consumer
    if (req.user.type !== 'consumer') {
      return res.status(403).json({ message: 'Only consumers can add reviews' });
    }

    const review = {
      user: req.user.id,
      userType: 'Consumer', // Explicitly set to 'Consumer' to match the enum
      rating: req.body.rating,
      comment: req.body.comment
    };

    product.reviews.push(review);
    
    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    // If orderId is provided, mark the order as reviewed
    if (req.body.orderId) {
      const Order = require('../db_models/Order');
      await Order.findByIdAndUpdate(req.body.orderId, { hasReviewed: true });
    }

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      product
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
}; 