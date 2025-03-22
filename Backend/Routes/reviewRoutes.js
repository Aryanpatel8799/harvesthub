const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth');
const {
  createReview,
  getFarmerReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

// Consumer routes
router.post('/', protect, authorize('consumer'), createReview);
router.put('/:reviewId', protect, authorize('consumer'), updateReview);
router.delete('/:reviewId', protect, authorize('consumer'), deleteReview);

// Public routes
router.get('/farmer/:farmerId', getFarmerReviews);

module.exports = router; 