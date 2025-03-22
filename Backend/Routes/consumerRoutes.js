const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const consumerController = require('../controllers/consumerControllers');
const { auth } = require('../Middleware/authMiddleware');

// Register route
router.post('/register', [
    body('fullName').isLength({min: 3}).trim().withMessage('Name must be at least 3 characters long'),
    body('email').isEmail().trim().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({min: 6}).trim().withMessage('Password must be at least 6 characters long')
], async (req, res, next) => {
    try {
        await consumerController.registerConsumer(req, res);
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
        await consumerController.loginConsumer(req, res);
    } catch (error) {
        next(error);
    }
});

// Get profile route
router.get('/profile', auth, async (req, res, next) => {
    try {
        await consumerController.getConsumerProfile(req, res);
    } catch (error) {
        next(error);
    }
});

// Update profile route
router.put('/profile', auth, async (req, res, next) => {
    try {
        await consumerController.updateConsumerProfile(req, res);
    } catch (error) {
        next(error);
    }
});

// Update preferences route
router.put('/preferences', auth, async (req, res, next) => {
    try {
        await consumerController.updatePreferences(req, res);
    } catch (error) {
        next(error);
    }
});

// Logout route
router.post('/logout', auth, async (req, res, next) => {
    try {
        await consumerController.logoutConsumer(req, res);
    } catch (error) {
        next(error);
    }
});

// Nutrition routes

module.exports = router; 