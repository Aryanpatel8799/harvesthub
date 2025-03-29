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

// Import routes that actually exist
const userRoutes = require('./Routes/userRoutes');
const farmerRoutes = require('./Routes/farmerRoutes');
const consumerRoutes = require('./Routes/consumerRoutes');
const productRoutes = require('./Routes/productRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const soilDetailsRoutes = require('./Routes/soilDetailsRoutes');
const soilCertificationRoutes = require('./Routes/soilCertificationRoutes');
const orderRoutes = require('./Routes/orderRoutes');
const farmImageRoutes = require('./Routes/farmImageRoutes');
const marketDataRoutes = require('./Routes/marketDataRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const translationRoutes = require('./Routes/translationRoutes');

// Import middleware and models
const { auth } = require('./Middleware/authMiddleware');
const { Farmer, Consumer } = require('./db_models');

// Initialize express app
const app = express();

// Middleware for all routes except Stripe webhook
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

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

// CORS middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.CLIENT_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked for origin:', origin);
            console.log('Allowed origins:', allowedOrigins);
        }
        
        // Allow all origins in development mode
        const isAllowed = process.env.NODE_ENV !== 'production' || allowedOrigins.indexOf(origin) !== -1;
        callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));
// methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const certificatesDir = path.join(uploadsDir, 'certificates');

if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory:', uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(certificatesDir)) {
    console.log('Creating certificates directory:', certificatesDir);
    fs.mkdirSync(certificatesDir, { recursive: true });
}

console.log('Upload directories:');
console.log('- Main:', fs.existsSync(uploadsDir) ? 'exists' : 'missing');
console.log('- Certificates:', fs.existsSync(certificatesDir) ? 'exists' : 'missing');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// Debug route for file uploads
app.get('/api/debug/uploads', (req, res) => {
    try {
        const mainExists = fs.existsSync(uploadsDir);
        const certExists = fs.existsSync(certificatesDir);
        
        let files = [];
        if (certExists) {
            files = fs.readdirSync(certificatesDir).slice(0, 10); // List first 10 files
        }
        
        res.json({
            uploadsDir: uploadsDir,
            certificatesDir: certificatesDir,
            dirStatus: {
                main: mainExists ? 'exists' : 'missing',
                certificates: certExists ? 'exists' : 'missing'
            },
            files: files,
            message: 'If directories are missing, they will be created on demand'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Debug route for direct file upload testing
app.post('/api/debug/file-upload', (req, res) => {
    try {
        const multer = require('multer');
        const storage = multer.diskStorage({
            destination: function(req, file, cb) {
                cb(null, 'uploads/debug');
            },
            filename: function(req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            }
        });
        
        // Create debug directory if it doesn't exist
        const debugDir = path.join(__dirname, 'uploads/debug');
        if (!fs.existsSync(debugDir)) {
            fs.mkdirSync(debugDir, { recursive: true });
        }
        
        const upload = multer({ storage: storage }).single('testFile');
        
        upload(req, res, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            console.log('Debug file upload received:', req.file);
            console.log('Debug form data:', req.body);
            
            res.json({
                message: 'File uploaded successfully',
                file: req.file,
                body: req.body
            });
        });
    } catch (error) {
        console.error('Debug file upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Routes
console.log('Mounting routes...');
app.use('/api/auth', userRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/consumers', consumerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/soil', soilDetailsRoutes);
app.use('/api/soil', soilCertificationRoutes);
console.log('Soil certification routes mounted at: /api/soil');

app.use('/api/orders', orderRoutes);
app.use('/api/farm-images', farmImageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/translations', translationRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
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