const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin only routes
router.get('/', authenticate, authorize(['ADMIN']), userController.getAllUsers);
router.post('/', authenticate, authorize(['ADMIN']), userController.createUser);
router.put('/:userId', authenticate, authorize(['ADMIN']), userController.updateUser);
router.delete('/:userId', authenticate, authorize(['ADMIN']), userController.deleteUser);

module.exports = router;
