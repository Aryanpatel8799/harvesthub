const express = require('express');
const router = express.Router();
const { login, logout, checkAuth } = require('../controllers/userController');
const { auth } = require('../Middleware/authMiddleware');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/check-auth', auth, checkAuth);
router.post('/logout', auth, logout);

module.exports = router; 