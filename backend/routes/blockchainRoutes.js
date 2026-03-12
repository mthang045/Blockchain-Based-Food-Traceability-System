const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchain.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/network', blockchainController.getNetworkInfo);
router.get('/transaction/:txHash', blockchainController.getTransaction);
router.get('/verify/:productId', blockchainController.verifyProduct);

// Protected routes
router.get('/logs', authenticate, blockchainController.getAllLogs);

module.exports = router;
