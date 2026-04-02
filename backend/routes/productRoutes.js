const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { requireUserPrivateKey } = require('../middleware/txSigning.middleware');
const { requireDigitalSignature } = require('../middleware/signature.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/batch/:batchNumber', productController.getBatchByNumber);
router.get('/batch/:batchNumber/traceability/verify', productController.verifyBatchTraceability);
router.get('/qr/:qrCode', productController.getProductByQRCode);
router.get('/:productId/history', productController.getProductHistory);
router.get('/:productId/traceability', productController.getProductTraceability);
router.get('/:productId/traceability/verify', productController.verifyProductTraceability);
router.get('/:productId', productController.getProductById);

// Protected routes (require authentication)
router.post('/signature/challenge', authenticate, productController.createSignatureChallenge);

router.post(
	'/',
	authenticate,
	authorize(['ADMIN', 'MANUFACTURER']),
	requireDigitalSignature,
	requireUserPrivateKey,
	productController.createBatch
);
router.post(
	'/batches',
	authenticate,
	authorize(['ADMIN', 'MANUFACTURER']),
	requireDigitalSignature,
	requireUserPrivateKey,
	productController.createBatch
);
router.put('/:productId', authenticate, productController.updateProduct);
router.put(
	'/:productId/status',
	authenticate,
	authorize(['ADMIN', 'MANUFACTURER', 'TRANSPORTER', 'STORE']),
	requireDigitalSignature,
	requireUserPrivateKey,
	productController.updateProductStatus
);
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router;
