const farmerService = require('../Services/farmerService');
const {body,validationResult, cookie} = require('express-validator');
const Farmer = require('../db_models/farmerModel');
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const bcrypt = require('bcrypt');
const Order = require('../db_models/Order');
const Review = require('../db_models/Review');

const registerFarmer = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        // Check if farmer already exists
        const farmerExists = await Farmer.findOne({ email });
        if (farmerExists) {
            return res.status(400).json({ message: 'Farmer already exists with this email' });
        }
        
        // Create new farmer
        const farmer = new Farmer({
            fullName,
            email,
            password
        });
        
        // Save farmer to database
        await farmer.save();
        
        // Generate token
        const token = farmer.generateAuthToken();
        
        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        
        const farmerData = farmer.toPublicProfile();
        
        // Return success response
        res.status(201).json({
            message: 'Farmer registered successfully',
            user: farmerData
        });
    } catch (error) {
        console.error('Error registering farmer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginFarmer = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if farmer exists
        const farmer = await Farmer.findOne({ email });
        if (!farmer) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Check if password is correct
        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Update last login time
        farmer.lastLogin = Date.now();
        await farmer.save();
        
        // Generate token
        const token = farmer.generateAuthToken();
        
        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        
        const farmerData = farmer.toPublicProfile();
        
        // Return success response
        res.status(200).json({
            message: 'Farmer logged in successfully',
            user: farmerData
        });
    } catch (error) {
        console.error('Error logging in farmer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const logoutFarmer = async (req, res) => {
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
        res.status(200).json({ message: 'Farmer logged out successfully' });
    } catch (error) {
        console.error('Error logging out farmer:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getFarmerProfile = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const farmer = await Farmer.findById(farmerId).select('-password');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        const farmerData = farmer.toPublicProfile();
        
        res.status(200).json({ user: farmerData });
    } catch (error) {
        console.error('Error getting farmer profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateFarmerProfile = async (req, res) => {
    try {
        const baseUrl = process.env.SERVER_URL || 'http://localhost:5000';
        const updates = { ...req.body };

        // Handle farm images
        if (req.files && req.files.farmImages) {
            const farmImages = req.files.farmImages.map(file => ({
                url: `${baseUrl}/uploads/${file.filename}`,
                caption: ''
            }));
            updates.farmImages = farmImages;
        }

        // Handle farm videos
        if (req.files && req.files.farmVideos) {
            const farmVideos = req.files.farmVideos.map(file => ({
                url: `${baseUrl}/uploads/${file.filename}`,
                caption: ''
            }));
            updates.farmVideos = farmVideos;
        }

        const farmer = await Farmer.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: 'Farmer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: farmer
        });
    } catch (error) {
        console.error('Error updating farmer profile:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error updating farmer profile'
        });
    }
};

const getFarmerTotalOrders = async (req, res) => {
    try {
        const farmerId = req.user.id;
        const farmer = await Farmer.findById(farmerId).select('totalOrders');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        res.status(200).json({ totalOrders: farmer.totalOrders });
    } catch (error) {
        console.error('Error getting farmer total orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const incrementTotalOrders = async (farmerId) => {
    try {
        const farmer = await Farmer.findById(farmerId);
        if (farmer) {
            farmer.totalOrders += 1;
            await farmer.save();
        }
    } catch (error) {
        console.error('Error incrementing total orders:', error);
    }
};

const getFarmerDetails = async (req, res) => {
    try {
        const farmerId = req.params.id;
        const farmer = await Farmer.findById(farmerId).select('-password');

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        // Get average rating from reviews
        const reviews = await Review.find({ farmer: farmer._id });
        const rating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        // Combine farmer data with calculated fields
        const farmerData = {
            ...farmer.toObject(),
            rating
        };

        res.json({ farmer: farmerData });
    } catch (error) {
        console.error('Error fetching farmer details:', error);
        res.status(500).json({ message: 'Error fetching farmer details' });
    }
};

module.exports = {
    registerFarmer,
    loginFarmer,
    logoutFarmer,
    getFarmerProfile,
    updateFarmerProfile,
    getFarmerTotalOrders,
    incrementTotalOrders,
    getFarmerDetails
};
