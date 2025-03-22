const jwt = require('jsonwebtoken');
const { Farmer, Consumer } = require('../db_models');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header or cookies
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Check if user still exists
            let user;
            if (decoded.type === 'farmer') {
                user = await Farmer.findById(decoded.id);
            } else if (decoded.type === 'consumer') {
                user = await Consumer.findById(decoded.id);
            }

            if (!user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }

            // Add user to request object
            req.user = {
                id: user._id,
                type: decoded.type
            };
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token is invalid or expired' });
        }
    } catch (error) {
        next(error);
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.type)) {
            return res.status(403).json({
                message: `User type ${req.user.type} is not authorized to access this route`
            });
        }
        next();
    };
}; 