const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  consumer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  consumerDetails: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    deliveryInstructions: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['not_paid', 'processing', 'paid', 'failed', 'refunded'],
    default: 'not_paid'
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'bank_transfer', 'cash_on_delivery', null],
    default: null
  },
  rejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual for formatted dates
orderSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt ? this.createdAt.toLocaleDateString() : 'N/A';
});

orderSchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt ? this.updatedAt.toLocaleDateString() : 'N/A';
});

module.exports = mongoose.model('Order', orderSchema); 