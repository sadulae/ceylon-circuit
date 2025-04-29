import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    console.log('AUTH DEBUG - Headers:', req.headers);
    
    // Get token from header or cookie
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('AUTH DEBUG - Token from header:', token ? 'Present' : 'Missing');
    } else if (req.cookies && req.cookies.token) {
      // Get token from cookie
      token = req.cookies.token;
      console.log('AUTH DEBUG - Token from cookie:', token ? 'Present' : 'Missing');
    }

    if (!token) {
      console.log('AUTH DEBUG - No token found');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('AUTH DEBUG - Decoded token:', decoded);

    // Find the user and add complete user to request
    const user = await User.findById(decoded.id || decoded.userId);
    
    if (!user) {
      console.log('AUTH DEBUG - User not found');
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('AUTH DEBUG - User found:', user._id);
    console.log('AUTH DEBUG - User is admin:', user.isAdmin || user.role === 'admin');
    
    // Add complete user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('AUTH DEBUG - Auth middleware error:', err);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Grant access to specific roles (handles both role property and isAdmin flag)
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('AUTH DEBUG - Authorize middleware called for roles:', roles);
    console.log('AUTH DEBUG - User data:', { 
      id: req.user._id, 
      role: req.user.role, 
      isAdmin: req.user.isAdmin 
    });
    
    // Check if the user is an admin using isAdmin flag
    if (roles.includes('admin') && req.user.isAdmin === true) {
      console.log('AUTH DEBUG - User authorized as admin via isAdmin flag');
      return next();
    }
    
    // Also check the role property for backward compatibility
    if (req.user.role && roles.includes(req.user.role)) {
      console.log('AUTH DEBUG - User authorized via role property:', req.user.role);
      return next();
    }
    
    // Neither isAdmin flag nor role property matched required roles
    console.log('AUTH DEBUG - Authorization failed');
    return res.status(403).json({
      msg: `User is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
  };
}; 