const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new blood bank
router.post('/register', register);

// Login
router.post('/login', login);

// Get profile (protected)
router.get('/profile', authenticate, getProfile);

module.exports = router;