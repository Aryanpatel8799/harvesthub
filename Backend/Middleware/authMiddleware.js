const jwt = require('jsonwebtoken');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const Farmer = require('../db_models/farmerModel');
const Consumer = require('../db_models/consumerModel');
const { promisify } = require('util');
const jwtVerify = promisify(jwt.verify);
const tokenBlacklist = new Set();

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.token;
    
    // If token not in cookies, check authorization header
    if (!token && req.headers.authorization) {
      // Make sure it's a Bearer token
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Check if token exists
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if token is blacklisted
    const isTokenBlacklisted = await BlacklistToken.findOne({ token });
    if (isTokenBlacklisted) {
      console.log('Token is blacklisted');
      return res.status(401).json({ message: 'Token is invalid' });
    }

    // Verify token
    const decoded = await jwtVerify(token, process.env.JWT_SECRET_KEY);
    
    if (!decoded || !decoded.id || !decoded.type) {
      console.log('Invalid token payload', decoded);
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Check user type and get user data
    let user;
    if (decoded.type === 'farmer') {
      user = await Farmer.findById(decoded.id).select('-password');
      if (!user) {
        console.log('Farmer not found with id', decoded.id);
        return res.status(404).json({ message: 'Farmer not found' });
      }
    } else if (decoded.type === 'consumer') {
      user = await Consumer.findById(decoded.id).select('-password');
      if (!user) {
        console.log('Consumer not found with id', decoded.id);
        return res.status(404).json({ message: 'Consumer not found' });
      }
    } else {
      console.log('Invalid user type', decoded.type);
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Set user in request object with explicit type from token
    req.user = {
      ...user.toObject(),
      type: decoded.type // Ensure type is explicitly set from token
    };
    
    // Ensure user has both _id and id properties
    if (!req.user._id) {
      req.user._id = user.id || decoded.id;
    }
    
    if (!req.user.id) {
      req.user.id = user._id || decoded.id;
    }

    console.log('Auth successful:', {
      userId: req.user._id,
      userType: req.user.type
    });

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if user is a farmer
const farmerOnly = (req, res, next) => {
  if (req.user.type !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmers only.' });
  }
  next();
};

// Middleware to check if user is a consumer
const consumerOnly = (req, res, next) => {
  console.log('Consumer check - User type:', {
    userType: req.user?.type,
    userId: req.user?._id?.toString() || req.user?.id?.toString() || 'undefined'
  });
  
  if (!req.user || req.user.type !== 'consumer') {
    return res.status(403).json({ 
      message: 'Access denied. Consumers only.',
      userType: req.user?.type || 'undefined' 
    });
  }
  next();
};

// Export all middleware functions
module.exports = {
    auth: authMiddleware,
    farmerOnly,
    consumerOnly
};