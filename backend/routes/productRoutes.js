const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/qr/:qrCode', productController.getProductByQRCode);
router.get('/:productId', productController.getProductById);
router.get('/:productId/history', productController.getProductHistory);

// QR Code scanning endpoint - Public access for consumers
router.get('/:productId/traceability', productController.getProductTraceability);

// Protected routes (require authentication)
router.post('/', authenticate, productController.createProduct);
router.put('/:productId', authenticate, productController.updateProduct);
router.put('/:productId/status', authenticate, productController.updateProductStatus);
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router;
