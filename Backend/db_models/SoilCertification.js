const mongoose = require('mongoose');

const soilComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  isNatural: { type: Boolean, default: true }
});

const soilCertificationSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  components: [soilComponentSchema],
  certificateFile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Virtual for date field used in frontend
soilCertificationSchema.virtual('date').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included when converting to JSON
soilCertificationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    return ret;
  }
});

const SoilCertification = mongoose.model('SoilCertification', soilCertificationSchema);

module.exports = SoilCertification; 