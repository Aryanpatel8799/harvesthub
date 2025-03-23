const mongoose = require('mongoose');

// Import models that actually exist
const Farmer = require('./farmerModel');
const Consumer = require('./consumerModel');
const Product = require('./productModel');
const BlacklistToken = require('./blacklistTokenModel');
const User = require('./User');
const Admin = require('./Admin');
const SoilCertification = require('./SoilCertification');
const SoilDetails = require('./SoilDetails');

// Register models explicitly
mongoose.model('Farmer', Farmer.schema);
mongoose.model('Consumer', Consumer.schema);
mongoose.model('Product', Product.schema);

// Export models
module.exports = {
    Farmer: mongoose.model('Farmer'),
    Consumer: mongoose.model('Consumer'),
    Product: mongoose.model('Product'),
    BlacklistToken,
    User,
    Admin,
    SoilCertification,
    SoilDetails
}; 