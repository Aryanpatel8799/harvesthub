const mongoose = require('mongoose');

const soilDetailsSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  soilType: {
    type: String,
    required: true,
    enum: ['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalky']
  },
  pH: {
    type: Number,
    required: true,
    min: 0,
    max: 14
  },
  organicMatter: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  nitrogen: {
    type: Number,
    required: true,
    min: 0
  },
  phosphorus: {
    type: Number,
    required: true,
    min: 0
  },
  potassium: {
    type: Number,
    required: true,
    min: 0
  },
  certificateUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  },
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
soilDetailsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SoilDetails', soilDetailsSchema); 