const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Extract token
        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by decoded userId
        const user = await User.findById(decoded.userId);

        // If no user found
        if (!user) {
            return res.status(401).json({ message: 'Invalid token, user not found' });
        }

        // Attach user to request
        req.user = user;

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        // Handle specific token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        console.error('Error in auth middleware:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = function(req, res, next) {
    if (req.isAuthenticated()) {  // Passport.js provides this method
        return next();
    }
    res.redirect('/login');
};