const productService = require('../services/product.service');
const { sanitizeForLog } = require('../utils/logSanitizer');
const { buildSignatureMessage } = require('../middleware/signature.middleware');

const buildTxOptions = (req) => {
  const txOptions = {
    ...(req.txSigningOptions || {})
  };

  if (req.signatureAuth?.walletAddress) {
    txOptions.expectedWalletAddress = req.signatureAuth.walletAddress;
  }

  return txOptions;
};

const createSignatureChallenge = async (req, res) => {
  try {
    const { method, path, walletAddress } = req.body || {};

    if (!method || !path || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'method, path, walletAddress are required.'
      });
    }

    const normalizedPath = String(path).startsWith('/') ? String(path) : `/${String(path)}`;
    const timestamp = Date.now();
    const nonce = `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
    const userId = req.user?.id || req.user?._id?.toString() || 'unknown';

    const message = buildSignatureMessage({
      userId,
      walletAddress,
      method,
      path: normalizedPath,
      timestamp,
      nonce
    });

    res.status(200).json({
      success: true,
      data: {
        userId,
        method: String(method).toUpperCase(),
        path: normalizedPath,
        walletAddress,
        timestamp,
        nonce,
        message,
        expiresInMs: 5 * 60 * 1000
      }
    });
  } catch (error) {
    console.error('Error creating signature challenge:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const txOptions = buildTxOptions(req);
    const result = await productService.createProduct(productData, req.user, txOptions);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating product:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createBatch = async (req, res) => {
  try {
    const batchData = req.body;
    const txOptions = buildTxOptions(req);
    const result = await productService.createBatch(batchData, req.user, txOptions);

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating batch:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBatchByNumber = async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = await productService.getBatchByNumber(batchNumber);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error fetching batch:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product status
const updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status, location, notes } = req.body;
    const txOptions = buildTxOptions(req);
    
    const result = await productService.updateProductStatus(
      productId,
      status,
      { location, notes },
      req.user,
      txOptions
    );
    
    res.status(200).json({
      success: true,
      message: 'Product status updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating product status:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product history from blockchain
const getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const history = await productService.getProductHistory(productId);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching product history:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get product traceability for QR code scanning
 * This endpoint is designed for consumers to verify product authenticity
 * and view complete supply chain journey
 * 
 * @route GET /api/products/traceability/:productId
 * @access Public
 */
const getProductTraceability = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    console.log(`📱 QR Scan: Getting traceability for product ${productId}`);

    // Get product traceability from service
    const traceabilityData = await productService.getProductTraceability(productId);

    // If product not found
    if (!traceabilityData.success) {
      return res.status(404).json({
        success: false,
        message: traceabilityData.message || 'Product not found',
        productId: productId,
        verified: false
      });
    }

    // Return successful traceability data
    res.status(200).json({
      success: true,
      message: 'Product traceability retrieved successfully',
      verified: traceabilityData.verified,
      dataSource: traceabilityData.dataSource,
      data: {
        product: traceabilityData.product,
        journey: traceabilityData.journey,
        blockchainHistory: traceabilityData.blockchainHistory,
        summary: {
          totalStages: traceabilityData.journey.length,
          currentStage: traceabilityData.journey[traceabilityData.journey.length - 1]?.stage,
          currentStatus: traceabilityData.product.currentStatus,
          isVerified: traceabilityData.verified,
          verifiedBy: traceabilityData.verified ? 'Blockchain' : 'Database'
        }
      },
      timestamp: traceabilityData.timestamp
    });

  } catch (error) {
    console.error('❌ Error fetching product traceability:', sanitizeForLog(error));
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product traceability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const verifyProductTraceability = async (req, res) => {
  try {
    const { productId } = req.params;
    const verification = await productService.verifyTraceability(productId);

    if (!verification.success) {
      return res.status(404).json({
        success: false,
        message: verification.message
      });
    }

    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying product traceability:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const verifyBatchTraceability = async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const verification = await productService.verifyTraceability(batchNumber);

    if (!verification.success) {
      return res.status(404).json({
        success: false,
        message: verification.message
      });
    }

    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying batch traceability:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product (full update)
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;
    
    const result = await productService.updateProduct(productId, updateData, req.user);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating product:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const result = await productService.deleteProduct(productId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by QR Code
const getProductByQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;
    
    const product = await productService.getProductByQRCode(qrCode);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with this QR code'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by QR code:', sanitizeForLog(error));
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSignatureChallenge,
  createProduct,
  createBatch,
  getAllProducts,
  getProductById,
  getBatchByNumber,
  updateProductStatus,
  getProductHistory,
  getProductTraceability,
  verifyProductTraceability,
  verifyBatchTraceability,
  updateProduct,
  deleteProduct,
  getProductByQRCode
};
