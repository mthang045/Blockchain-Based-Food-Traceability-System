const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);

// Admin only routes
router.get('/', authenticate, authorize(['ADMIN']), userController.getAllUsers);

module.exports = router;
