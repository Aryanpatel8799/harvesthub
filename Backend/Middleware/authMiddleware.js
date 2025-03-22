const jwt = require('jsonwebtoken');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const Farmer = require('../db_models/farmerModel');
const Consumer = require('../db_models/consumerModel');

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
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
      return res.status(401).json({ message: 'Invalid user type' });
    }

    // Set user data to request object
    req.user = {
      id: user._id,
      type: decoded.type
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error' });
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
  if (req.user.type !== 'consumer') {
    return res.status(403).json({ message: 'Access denied. Consumers only.' });
  }
  next();
};

// Export all middleware functions
module.exports = {
    auth: authMiddleware,
    farmerOnly,
    consumerOnly
};