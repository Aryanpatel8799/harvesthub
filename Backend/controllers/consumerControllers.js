const { validationResult } = require('express-validator');
const Consumer = require('../db_models/consumerModel');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register new consumer
module.exports.registerConsumer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if consumer already exists
    const consumerExists = await Consumer.findOne({ email });
    if (consumerExists) {
      return res.status(400).json({ message: "Consumer already exists with this email" });
    }

    // Create new consumer
    const consumer = new Consumer({
      fullName,
      email,
      password
    });

    // Save consumer to database
    await consumer.save();

    // Generate token
    const token = consumer.generateAuthToken();

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    const consumerData = consumer.toPublicProfile();

    // Return success response
    res.status(201).json({
      message: "Consumer registered successfully",
      user: consumerData
    });
  } catch (error) {
    console.error("Error registering consumer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login consumer
module.exports.loginConsumer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if consumer exists
    const consumer = await Consumer.findOne({ email });
    if (!consumer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if password is correct
    const isMatch = await consumer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Update last login time
    consumer.lastLogin = Date.now();
    await consumer.save();

    // Generate token
    const token = consumer.generateAuthToken();

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    const consumerData = consumer.toPublicProfile();

    // Return success response
    res.status(200).json({
      message: "Consumer logged in successfully",
      user: consumerData
    });
  } catch (error) {
    console.error("Error logging in consumer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout consumer
module.exports.logoutConsumer = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Add token to blacklist
    const blacklistToken = new BlacklistToken({
      token
    });

    await blacklistToken.save();

    // Clear token cookie
    res.clearCookie('token');

    // Return success response
    res.status(200).json({ message: "Consumer logged out successfully" });
  } catch (error) {
    console.error("Error logging out consumer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get consumer profile
module.exports.getConsumerProfile = async (req, res) => {
  try {
    const consumerId = req.user.id;
    const consumer = await Consumer.findById(consumerId).select('-password');
    
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    const consumerData = consumer.toPublicProfile();
    
    res.status(200).json({ user: consumerData });
  } catch (error) {
    console.error("Error getting consumer profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update consumer preferences
module.exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const consumerId = req.user.id;

    // Find the consumer
    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // Update preferences
    if (preferences) {
      if (preferences.dietaryRestrictions) {
        consumer.preferences.dietaryRestrictions = preferences.dietaryRestrictions;
      }
      if (preferences.allergies) {
        consumer.preferences.allergies = preferences.allergies;
      }
      if (preferences.favoriteProducts) {
        consumer.preferences.favoriteProducts = preferences.favoriteProducts;
      }
    }

    // Save updated consumer
    await consumer.save();

    // Return updated consumer data
    const consumerData = consumer.toPublicProfile();
    
    res.status(200).json({
      message: "Consumer preferences updated successfully",
      user: consumerData
    });
  } catch (error) {
    console.error("Error updating consumer preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update consumer profile
module.exports.updateConsumerProfile = async (req, res) => {
  try {
    const { fullName, email, phone, address } = req.body;
    const consumerId = req.user.id;

    // Find the consumer
    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    // Update fields if provided
    if (fullName) consumer.fullName = fullName;
    if (email) consumer.email = email;
    if (phone) consumer.phone = phone;
    if (address) consumer.address = address;

    // Save updated consumer
    await consumer.save();

    // Return updated consumer data
    const consumerData = consumer.toPublicProfile();
    
    res.status(200).json({
      message: "Consumer profile updated successfully",
      user: consumerData
    });
  } catch (error) {
    console.error("Error updating consumer profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// module.exports = {
//   registerConsumer,
//   loginConsumer,
//   logoutConsumer,
//   getConsumerProfile,
//   updatePreferences,
//   updateConsumerProfile
// }; 