const User = require('../db_models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    console.log("Login request received:", { email, userType });

    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and user type'
      });
    }

    // Find user by email
    const user = await User.findOne({ email, role: userType });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token with comprehensive information
    // Always use hardcoded JWT_SECRET for testing to ensure consistency
    const JWT_SECRET = '8799';
    
    // Compare with env variable to detect mismatches
    if (process.env.JWT_SECRET !== JWT_SECRET) {
      console.log('WARNING: JWT_SECRET mismatch between hardcoded and environment variable');
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        type: user.role, // Include type for compatibility
        email: user.email,
        fullName: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Log the secret used for token generation for debugging
    console.log("JWT_SECRET used for token generation:", process.env.JWT_SECRET.substring(0, 3) + "..." + process.env.JWT_SECRET.substring(process.env.JWT_SECRET.length - 3));
    console.log("Generated token:", token.substring(0, 10) + "..." + token.substring(token.length - 10));

    // Set cookie with proper settings for different environments
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    console.log("Cookie set:", res.getHeaders());

    // Send response without password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    // Include type field that matches userType for front-end compatibility
    userResponse.type = userType;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Check authentication status
 * @route GET /api/users/check-auth
 * @access Private
 */
exports.checkAuth = async (req, res) => {
  try {
    console.log('Check auth endpoint called');
    console.log('User in request:', req.user ? req.user._id : 'none');
    
    // User is already set by auth middleware
    const { password, ...userWithoutPassword } = req.user.toObject();
    
    // Make sure we include type field for frontend compatibility
    const userType = req.user.role || req.user.type;
    console.log('User type for response:', userType);
    
    res.status(200).json({
      success: true,
      user: {
        ...userWithoutPassword,
        type: userType
      }
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Logout user
 * @route POST /api/users/logout
 * @access Private
 */
exports.logout = async (req, res) => {
  try {
    console.log('Logout endpoint called');
    
    // Get token from cookie
    const token = req.cookies.token;
    console.log('Token in cookie:', token ? 'present' : 'none');
    
    if (token) {
      // Add token to blacklist
      const BlacklistToken = require('../db_models/blacklistTokenModel');
      await BlacklistToken.create({ token });
      console.log('Token added to blacklist');
      
      // Clear cookie with proper settings
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.cookie('token', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        expires: new Date(0),
        path: '/'
      });
      
      console.log('Cookie cleared');
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
}; 