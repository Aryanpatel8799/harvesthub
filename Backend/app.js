const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const session = require('express-session');

// Import models
require('./db_models');

// Import routes
const farmerRoutes = require('./Routes/farmerRoutes');
const consumerRoutes = require('./Routes/consumerRoutes');
const productRoutes = require('./Routes/productRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const farmImageRoutes = require('./Routes/farmImageRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');

// Import middleware and models
const { auth } = require('./Middleware/authMiddleware');
const { Farmer, Consumer } = require('./db_models');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/consumers', consumerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farm-images', farmImageRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Check auth endpoint
app.get('/api/check-auth', auth, async (req, res, next) => {
    try {
        const userType = req.user.type;
        
        if (userType === 'farmer') {
            const farmer = await Farmer.findById(req.user.id).select('-password');
            if (!farmer) {
                return res.status(404).json({ message: 'Farmer not found' });
            }
            res.json({ user: farmer.toPublicProfile() });
        } else if (userType === 'consumer') {
            const consumer = await Consumer.findById(req.user.id).select('-password');
            if (!consumer) {
                return res.status(404).json({ message: 'Consumer not found' });
            }
            res.json({ user: consumer.toPublicProfile() });
        } else {
            res.status(401).json({ message: 'Invalid user type' });
        }
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error details
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
    });
    
    // Determine if error is a MongoDB error
    const isMongoError = err.name === 'MongoError' || err.name === 'MongoServerError';
    
    // Handle specific error types
    if (isMongoError) {
        return res.status(500).json({
            message: 'Database error occurred',
            error: process.env.NODE_ENV === 'development' ? {
                code: err.code,
                message: err.message
            } : 'Internal server error'
        });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }
    
    // Default error response
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            details: err
        } : undefined
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;