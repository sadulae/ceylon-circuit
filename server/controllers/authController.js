import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { createError } from '../utils/error.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(createError(400, 'Please provide all required fields'));
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(createError(400, 'User already exists'));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            const token = generateToken(user._id);
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: token
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        console.log('Login request received:', { email: req.body.email, hasPassword: !!req.body.password });
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return next(createError(400, 'Please provide both email and password'));
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(createError(400, 'Please provide a valid email address'));
        }

        // Check for user email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('Login attempt failed: User not found for email:', email);
            return next(createError(401, 'Invalid email or password'));
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('Login attempt failed: Invalid password for user:', user._id);
            return next(createError(401, 'Invalid email or password'));
        }

        try {
            // Check if JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables!');
                return next(createError(500, 'Server configuration error'));
            }
            
            // Generate token with full debugging
            console.log('Generating token for user:', user._id.toString());
            const token = generateToken(user._id);
            console.log('Token generated successfully:', token ? 'Yes' : 'No');
            if (token) {
                console.log('Token preview:', token.substring(0, 15) + '...');
            } else {
                console.error('Token generation failed - returned empty token');
                return next(createError(500, 'Failed to generate authentication token'));
            }
            
            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            
            // Debug cookie
            console.log('Set cookie header:', res.getHeader('Set-Cookie'));

            // Create response object with token
            const responseData = {
                _id: user._id,
                name: user.name || email.split('@')[0], // Fallback if name is missing
                email: user.email,
                isAdmin: user.isAdmin,
                token: token // Critical: Include token in response
            };
            
            // Extra safety - verify token is in response object
            if (!responseData.token) {
                console.error('CRITICAL ERROR: Token missing from responseData after assignment');
                responseData.token = token; // Try to add it again
            }
            
            // Debug log the actual response data being sent
            console.log('Sending login response data:', {
                ...responseData,
                token: responseData.token ? responseData.token.substring(0, 10) + '...' : 'MISSING',
                hasToken: !!responseData.token
            });
            
            // Send response with return to ensure no further processing
            return res.status(200).json(responseData);
        } catch (tokenError) {
            console.error('Error during token generation:', tokenError);
            return next(createError(500, 'Authentication error. Please try again.'));
        }
    } catch (error) {
        console.error('Login error:', error);
        next(createError(500, 'An error occurred during login. Please try again.'));
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
    res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return next(createError(404, 'User not found'));
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } catch (error) {
        next(error);
    }
};

// TEMPORARY DEBUG FUNCTION - REMOVE IN PRODUCTION
// @desc    Get current user info with fresh token
// @route   GET /api/auth/debug-my-token
// @access  Public (But should be restricted in production)
export const debugMyToken = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                message: 'Please provide an email as query parameter',
                example: '/api/auth/debug-my-token?email=your-email@example.com'
            });
        }
        
        console.log('DEBUG: Checking token for user:', email);
        
        // Find the user
        const user = await User.findOne({ email }).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate a fresh token
        const token = generateToken(user._id);
        
        console.log('DEBUG: Generated token preview:', token.substring(0, 15) + '...');
        
        // Create response data
        const responseData = {
            _id: user._id,
            name: user.name || email.split('@')[0],
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
            tokenInfo: {
                length: token.length,
                hasPeriods: token.includes('.'),
                preview: token.substring(0, 20) + '...'
            }
        };
        
        // Send it back
        return res.json(responseData);
    } catch (error) {
        console.error('Error in debug-my-token:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message
        });
    }
};

// @desc    Check if user is admin
// @route   GET /api/auth/admin-check
// @access  Private
export const checkAdmin = async (req, res) => {
    try {
        // req.user is available because of the verifyToken middleware
        const isAdmin = req.user && req.user.isAdmin === true;
        
        console.log(`Admin check for user ${req.user._id}: ${isAdmin ? 'Is Admin' : 'Not Admin'}`);
        
        res.json({
            isAdmin: isAdmin,
            userId: req.user._id,
            name: req.user.name,
            message: isAdmin ? 'User has admin privileges' : 'User does not have admin privileges'
        });
    } catch (error) {
        console.error('Error in admin check:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error checking admin status' 
        });
    }
};

// TEMPORARY DEBUG FUNCTION - REMOVE IN PRODUCTION
// @desc    Set user as admin (for debugging)
// @route   POST /api/auth/debug-make-admin
// @access  Public (But should be restricted in production)
export const debugMakeAdmin = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Please provide an email' });
        }
        
        console.log('DEBUG: Attempting to make user admin:', email);
        
        // Find the user
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Make user an admin
        user.isAdmin = true;
        await user.save();
        
        // Generate a fresh token with admin privileges
        const token = generateToken(user._id);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        console.log('DEBUG: Made user admin:', user.email);
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
            message: 'User has been granted admin privileges'
        });
    } catch (error) {
        console.error('Error making user admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 