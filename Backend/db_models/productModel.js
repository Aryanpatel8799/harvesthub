const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Herbs', 'Seeds', 'Fertilizers', 'Tools', 'Equipment Rental', 'Pesticides', 'Irrigation']
  },
  images: [{
    url: String,
    caption: String
  }],
  farmImages: [{
    url: String,
    caption: String
  }],
  organic: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  rental: {
    type: Boolean,
    default: false
  },
  rentalPrice: {
    type: Number,
    min: 0
  },
  rentalUnit: {
    type: String
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  location: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  expiryDate: {
    type: Date,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reviews.userType'
    },
    userType: {
      type: String,
      enum: ['Farmer', 'Consumer']
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate current discount based on expiry date
productSchema.methods.calculateCurrentDiscount = function() {
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let discount = 0;
  if (daysUntilExpiry <= 1) {
    discount = 50; // 50% discount if expiring in 1 day
  } else if (daysUntilExpiry <= 3) {
    discount = 30; // 30% discount if expiring in 2-3 days
  } else if (daysUntilExpiry <= 7) {
    discount = 15; // 15% discount if expiring in 4-7 days
  }

  this.discount = discount;
  return discount;
};

// Daily automatic discount update
productSchema.statics.updateAllDiscounts = async function() {
  const products = await this.find({ expiryDate: { $exists: true } });
  
  for (const product of products) {
    product.calculateCurrentDiscount();
    await product.save();
  }
};

const Product = mongoose.model('Product', productSchema);

// Schedule daily discount updates
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      await Product.updateAllDiscounts();
      console.log('Daily discount update completed');
    } catch (error) {
      console.error('Error updating discounts:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run every 24 hours
}

module.exports = Product; 