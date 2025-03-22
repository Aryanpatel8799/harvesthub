const farmerService = require('../Services/farmerService');
const {body,validationResult, cookie} = require('express-validator');
const Farmer = require('../db_models/farmerModel');
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const bcrypt = require('bcrypt');

module.exports.registerFarmer = async (req, res) => {
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

module.exports.loginFarmer = async (req, res) => {
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

module.exports.logoutFarmer = async (req, res) => {
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

module.exports.getFarmerProfile = async (req, res) => {
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

module.exports.updateFarmerProfile = async (req, res) => {
    try {
        const { fullName, email, phone, address, location, description, farmSize, cropTypes } = req.body;
        const farmerId = req.user.id;

        // Find the farmer
        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        // Update fields if provided
        if (fullName) farmer.fullName = fullName;
        if (email) farmer.email = email;
        if (phone) farmer.phone = phone;
        if (address) farmer.address = address;
        if (location) farmer.location = location;
        if (description) farmer.description = description;
        if (farmSize) farmer.farmSize = farmSize;
        if (cropTypes) farmer.cropTypes = cropTypes;

        // Handle farm media uploads
        if (req.files) {
            const apiUrl = process.env.API_URL || 'http://localhost:8000';

            // Handle farm images
            if (req.files.farmImages) {
                const images = Array.isArray(req.files.farmImages) ? req.files.farmImages : [req.files.farmImages];
                const imageCaptions = req.body.imageCaptions ? 
                    (Array.isArray(req.body.imageCaptions) ? req.body.imageCaptions : [req.body.imageCaptions]) 
                    : images.map(() => '');

                const farmImages = images.map((file, index) => ({
                    url: `${apiUrl}/uploads/${file.filename}`,
                    caption: imageCaptions[index] || ''
                }));

                farmer.farmImages = [...(farmer.farmImages || []), ...farmImages];
            }

            // Handle farm videos
            if (req.files.farmVideos) {
                const videos = Array.isArray(req.files.farmVideos) ? req.files.farmVideos : [req.files.farmVideos];
                const videoCaptions = req.body.videoCaptions ?
                    (Array.isArray(req.body.videoCaptions) ? req.body.videoCaptions : [req.body.videoCaptions])
                    : videos.map(() => '');

                const farmVideos = videos.map((file, index) => ({
                    url: `${apiUrl}/uploads/${file.filename}`,
                    caption: videoCaptions[index] || ''
                }));

                farmer.farmVideos = [...(farmer.farmVideos || []), ...farmVideos];
            }
        }

        // Save updated farmer
        await farmer.save();

        // Return updated farmer data
        const farmerData = farmer.toPublicProfile();
        
        res.status(200).json({
            message: 'Farmer profile updated successfully',
            user: farmerData
        });
    } catch (error) {
        console.error('Error updating farmer profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a new endpoint to get farmer's total orders
module.exports.getFarmerTotalOrders = async (req, res) => {
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

// Add a new endpoint to increment total orders
module.exports.incrementTotalOrders = async (farmerId) => {
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

// module.exports = {
//   registerFarmer,
//   loginFarmer,
//   logoutFarmer,
//   getFarmerProfile,
//   updateFarmerProfile
// };
