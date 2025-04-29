import express from 'express';
import { register, login, logout, getProfile, updateProfile, checkAdmin, debugMakeAdmin, debugMyToken } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/admin-check', verifyToken, checkAdmin);

// Debug routes - REMOVE IN PRODUCTION
router.post('/debug-make-admin', debugMakeAdmin);
router.get('/debug-my-token', debugMyToken);

// Token test route - REMOVE IN PRODUCTION
router.get('/test-token', (req, res) => {
  try {
    const testId = '12345testuser';
    const token = jwt.sign({ id: testId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    
    res.json({
      success: true, 
      token: token,
      tokenInfo: {
        length: token.length,
        hasPeriods: token.includes('.'),
        firstPart: token.substring(0, 20) + '...'
      },
      envInfo: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 