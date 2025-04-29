import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { createError } from '../utils/error.js';

export const verifyToken = async (req, res, next) => {
    try {
        // Enhanced debugging
        console.log('AUTH DEBUG - Headers:', req.headers.authorization ? 'Authorization header present' : 'No Authorization header');
        console.log('AUTH DEBUG - Cookies:', req.cookies.token ? 'Token cookie present' : 'No token cookie');
        
        // Check for token in cookies first
        let token = req.cookies.token;
        let tokenSource = 'cookie';
        
        // If no token in cookies, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
                tokenSource = 'header';
                console.log('AUTH DEBUG - Using token from Authorization header');
            }
        } else {
            console.log('AUTH DEBUG - Using token from cookie');
        }
        
        if (!token) {
            console.log('AUTH DEBUG - No token found in request');
            return next(createError(401, "You are not authenticated"));
        }
        
        console.log(`AUTH DEBUG - Token found in ${tokenSource}:`, token.substring(0, 15) + '...');
        
        // Check if token looks like a JWT (has two dots)
        if (!token.includes('.')) {
            console.log('AUTH DEBUG - Token format invalid - not a JWT token (missing periods)');
            res.clearCookie('token');
            return next(createError(401, "Invalid token format. Please log in again."));
        }
        
        // Verify the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('AUTH DEBUG - Token verified successfully, user ID:', decoded.id);
            
            // Find user and handle case where user doesn't exist
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                console.log('AUTH DEBUG - User not found in database');
                res.clearCookie('token');
                return next(createError(401, "Your session has expired. Please log in again."));
            }
            
            console.log('AUTH DEBUG - User found:', user._id.toString());
            console.log('AUTH DEBUG - User is admin:', user.isAdmin ? 'Yes' : 'No');
            
            req.user = user;
            return next();
        } catch (jwtError) {
            console.log('AUTH DEBUG - JWT verification error:', jwtError.name, jwtError.message);
            console.log('AUTH DEBUG - Token that failed verification:', token);
            res.clearCookie('token');
            if (jwtError.name === 'JsonWebTokenError') {
                return next(createError(401, "Invalid token. Please log in again."));
            }
            if (jwtError.name === 'TokenExpiredError') {
                return next(createError(401, "Your session has expired. Please log in again."));
            }
            return next(createError(401, "Authentication failed"));
        }
    } catch (error) {
        console.error('AUTH DEBUG - Unexpected error in verifyToken:', error.message);
        res.clearCookie('token');
        return next(createError(401, "Authentication failed"));
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        // First verify the token
        await verifyToken(req, res, (err) => {
            if (err) {
                console.log('AUTH DEBUG - Token verification failed in verifyAdmin');
                return next(err);
            }
            
            // If we get here, the token is valid and user exists
            if (!req.user || !req.user.isAdmin) {
                console.log('AUTH DEBUG - User is not admin:', req.user?._id.toString());
                return next(createError(403, "You are not authorized to perform this action"));
            }
            
            console.log('AUTH DEBUG - Admin verification successful');
            return next();
        });
    } catch (error) {
        console.error('AUTH DEBUG - Unexpected error in verifyAdmin:', error.message);
        return next(error);
    }
}; 