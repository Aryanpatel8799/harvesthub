// Middleware to check if the user is a farmer
const farmerOnly = (req, res, next) => {
    try {
        // Check if user exists and is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if the user is a farmer
        if (req.user.type !== 'farmer') {
            return res.status(403).json({ message: 'Access denied. Farmers only.' });
        }

        // If all checks pass, proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error in farmer middleware:', error);
        res.status(500).json({ message: 'Internal server error in authorization' });
    }
};

module.exports = farmerOnly; 