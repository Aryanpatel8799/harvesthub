const mongoose = require('mongoose');

// Import all models
const Farmer = require('./farmerModel');
const Consumer = require('./consumerModel');
const Product = require('./productModel');

// Register models explicitly
mongoose.model('Farmer', Farmer.schema);
mongoose.model('Consumer', Consumer.schema);
mongoose.model('Product', Product.schema);

// Export models
module.exports = {
    Farmer: mongoose.model('Farmer'),
    Consumer: mongoose.model('Consumer'),
    Product: mongoose.model('Product')
}; 