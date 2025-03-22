const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const farmerController = require('../controllers/farmerControllers');
const { auth } = require('../Middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'farmImages') {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
        } else if (file.fieldname === 'farmVideos') {
            if (!file.originalname.match(/\.(mp4|webm|ogg)$/)) {
                return cb(new Error('Only video files are allowed!'), false);
            }
        }
        cb(null, true);
    }
});

// Register route
router.post('/register', [
    body('fullName').isLength({min: 3}).trim().withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({min: 6}).trim().withMessage('Password must be at least 6 characters long')
], async (req, res, next) => {
    try {
        await farmerController.registerFarmer(req, res);
    } catch (error) {
        next(error);
    }
});

// Login route
router.post('/login', [
    body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({min: 6}).trim().withMessage('Password must be at least 6 characters long')
], async (req, res, next) => {
    try {
        await farmerController.loginFarmer(req, res);
    } catch (error) {
        next(error);
    }
});

// Get profile route
router.get('/profile', auth, async (req, res, next) => {
    try {
        await farmerController.getFarmerProfile(req, res);
    } catch (error) {
        next(error);
    }
});

// Update profile route with file upload
router.put('/profile', auth, upload.fields([
    { name: 'farmImages', maxCount: 5 },
    { name: 'farmVideos', maxCount: 3 }
]), async (req, res, next) => {
    try {
        await farmerController.updateFarmerProfile(req, res);
    } catch (error) {
        next(error);
    }
});

// Logout route
router.post('/logout', auth, async (req, res, next) => {
    try {
        await farmerController.logoutFarmer(req, res);
    } catch (error) {
        next(error);
    }
});

// Get farmer's total orders
router.get('/total-orders', auth, async (req, res, next) => {
    try {
        await farmerController.getFarmerTotalOrders(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

