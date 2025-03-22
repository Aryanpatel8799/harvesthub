const Review = require('../db_models/Review');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { farmerId, rating, comment } = req.body;
    
    // Check if user has already reviewed this farmer
    const existingReview = await Review.findOne({
      consumer: req.user._id,
      farmer: farmerId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this farmer'
      });
    }

    const review = new Review({
      consumer: req.user._id,
      farmer: farmerId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get reviews for a farmer
exports.getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('consumer', 'name')
      .sort('-date');
    
    // Calculate average rating
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({
      _id: req.params.reviewId,
      consumer: req.user._id
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      consumer: req.user._id
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}; 