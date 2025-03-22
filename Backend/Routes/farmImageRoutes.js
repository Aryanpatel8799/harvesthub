const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const {
  uploadImage,
  getFarmerImages,
  deleteImage
} = require('../controllers/farmImageController');

// Farmer routes
router.post('/upload', protect, authorize('farmer'), uploadImage);
router.delete('/:imageId', protect, authorize('farmer'), deleteImage);

// Public routes
router.get('/farmer/:farmerId', getFarmerImages);

module.exports = router; 