const jwt = require('jsonwebtoken');
const BlacklistToken = require('../db_models/blacklistTokenModel');
const Farmer = require('../db_models/farmerModel');
const Consumer = require('../db_models/consumerModel');
const Admin = require('../db_models/Admin');
const { promisify } = require('util');
const jwtVerify = promisify(jwt.verify);
const tokenBlacklist = new Set();
const User = require('../db_models/User');

const auth = async (req, res, next) => {
  try {
    let token;
    console.log('Auth middleware called for:', req.method, req.originalUrl);
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);

    // 1. Check if token exists in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies:', token);
    } 
    // 2. Check if token exists in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header:', token);
    }

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Check if token is blacklisted
    const isTokenBlacklisted = await BlacklistToken.findOne({ token });
    if (isTokenBlacklisted) {
      console.log('Token is blacklisted');
      return res.status(401).json({ message: 'Token is invalid' });
    }

    try {
      // Verify token using promisified jwt.verify
      console.log('Verifying token with JWT_SECRET:', process.env.JWT_SECRET);
      
      // Debug the token structure before verification
      try {
        const decoded = jwt.decode(token);
        console.log('Token payload before verification:', decoded);
      } catch (e) {
        console.log('Could not decode token payload:', e.message);
      }
      
      // Always use hardcoded JWT_SECRET for testing to ensure consistency
      const JWT_SECRET = '8799';
      
      // Compare with env variable to detect mismatches
      if (process.env.JWT_SECRET !== JWT_SECRET) {
        console.log('WARNING: JWT_SECRET mismatch between hardcoded and environment variable');
      }
      
      // Try verification with the hardcoded secret for testing
      const decoded = await jwtVerify(token, JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Find user by id
      if (decoded.role === 'admin') {
        console.log('Looking up admin user with id:', decoded.id);
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
          console.log('Admin not found:', decoded.id);
          return res.status(401).json({ message: 'Admin not found' });
        }
        req.user = admin;
        req.user.role = 'admin';
        req.user.type = 'admin';
        console.log('Admin user set in request:', req.user._id);
      } else {
        console.log('Looking up user with id:', decoded.id);
        console.log('User role from token:', decoded.role || decoded.type);
        
        // First try the User model
        let user = await User.findById(decoded.id).select('-password');
        
        // If not found, try the appropriate model based on role/type
        if (!user) {
          console.log('User not found in User collection, trying specific collections');
          const userType = decoded.role || decoded.type;
          
          if (userType === 'farmer') {
            user = await Farmer.findById(decoded.id).select('-password');
            console.log('Farmer lookup result:', user ? 'found' : 'not found');
          } else if (userType === 'consumer') {
            user = await Consumer.findById(decoded.id).select('-password');
            console.log('Consumer lookup result:', user ? 'found' : 'not found');
          }
        }
        
        if (!user) {
          console.log('User not found in any collection:', decoded.id);
          return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        req.user.type = decoded.role || decoded.type;
        console.log('User set in request:', req.user._id, 'with type:', req.user.type);
      }
      
      console.log('Auth successful for user:', req.user._id);
      next();
    } catch (error) {
      console.error('Auth middleware token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.type === 'admin')) {
    next();
  } else {
    console.log('Admin access denied for user:', req.user ? req.user._id : 'unknown');
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// Farmer-only middleware
const farmerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'farmer' || req.user.type === 'farmer')) {
    next();
  } else {
    console.log('Farmer access denied for user:', req.user ? req.user._id : 'unknown');
    res.status(403).json({ message: 'Access denied: Farmer role required' });
  }
};

// Consumer-only middleware
const consumerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'consumer' || req.user.type === 'consumer')) {
    next();
  } else {
    console.log('Consumer access denied for user:', req.user ? req.user._id : 'unknown');
    res.status(403).json({ message: 'Access denied: Consumer role required' });
  }
};

// Export all middleware functions
module.exports = {
    auth,
    adminOnly,
    farmerOnly,
    consumerOnly
};