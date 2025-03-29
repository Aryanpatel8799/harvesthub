const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  addReview 
} = require('../controllers/productController');
const { auth, farmerOnly } = require('../Middleware/authMiddleware');
const { uploadMiddleware, processUpload } = require('../Middleware/uploadMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected routes - require farmer authentication
router.post('/', auth, farmerOnly, uploadMiddleware, processUpload, createProduct);
router.put('/:id', auth, farmerOnly, uploadMiddleware, processUpload, updateProduct);
router.delete('/:id', auth, farmerOnly, deleteProduct);

// Review routes
router.post('/:id/reviews', auth, addReview);

module.exports = router; 