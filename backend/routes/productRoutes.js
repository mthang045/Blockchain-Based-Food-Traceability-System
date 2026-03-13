const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/qr/:qrCode', productController.getProductByQRCode);
router.get('/:productId/history', productController.getProductHistory);
router.get('/:productId/traceability', productController.getProductTraceability);
router.get('/:productId', productController.getProductById);

// Protected routes (require authentication)
router.post('/', authenticate, productController.createProduct);
router.put('/:productId', authenticate, productController.updateProduct);
router.put('/:productId/status', authenticate, productController.updateProductStatus);
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router;
