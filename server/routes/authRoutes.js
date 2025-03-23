const express = require('express');
const router = express.Router();
const { register, login, updateProfile, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes (protected)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router; 