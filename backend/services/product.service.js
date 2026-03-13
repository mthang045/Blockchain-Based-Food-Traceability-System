const mongoose = require('mongoose');
const Product = require('../models/Product.model');
const blockchainService = require('./blockchain.service');

const STATUS_MAP = {
  PENDING: 'Pending',
  PRODUCED: 'Produced',
  MANUFACTURED: 'Produced',
  INTRANSIT: 'InTransit',
  IN_TRANSIT: 'InTransit',
  DELIVERED: 'Delivered',
  INSTORE: 'InStore',
  IN_STORE: 'InStore',
  SOLD: 'Sold'
};

const normalizeStatus = (status = 'Pending') => {
  if (!status) {
    return 'Pending';
  }

  const lookupKey = String(status)
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();

  return STATUS_MAP[lookupKey] || status;
};

const extractStatusFromHistory = (action, fallback) => {
  const match = action?.match(/Status changed to (.+)$/);
  return match?.[1] || fallback || 'Pending';
};

const serializeHistory = (history = []) => {
  return history.map((entry, index) => ({
    id: entry._id?.toString() || `${index}`,
    status: extractStatusFromHistory(entry.action, 'Pending'),
    stepName: extractStatusFromHistory(entry.action, 'Pending'),
    location: entry.location,
    timestamp: entry.timestamp,
    performedBy: entry.actor,
    notes: entry.notes || ''
  }));
};

const serializeProduct = (productDocument) => {
  if (!productDocument) {
    return null;
  }

  const product = productDocument.toObject ? productDocument.toObject() : productDocument;

  return {
    ...product,
    id: product.productId,
    currentStatus: product.status,
    manufacturer: product.producer?.name,
    manufacturerAddress: product.producer?.address,
    blockchainTxHash: product.transactionHash,
    history: serializeHistory(product.history)
  };
};

const buildProducer = (productData, user) => {
  const producerName =
    productData.producer?.name ||
    productData.manufacturer ||
    user?.username ||
    user?.email ||
    'Unknown producer';

  const producerAddress =
    productData.producer?.address ||
    productData.manufacturerAddress ||
    user?.walletAddress ||
    user?._id?.toString() ||
    'unknown-address';

  return {
    name: producerName,
    address: producerAddress,
    userId: productData.producer?.userId || user?._id?.toString()
  };
};

const createHistoryEntry = ({ actor, status, location, notes = '' }) => ({
  actor,
  action: `Status changed to ${status}`,
  timestamp: new Date(),
  location,
  notes
});

const generateProductId = () => `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

// Create a new product
const createProduct = async (productData, user) => {
  try {
    const status = normalizeStatus(productData.status || productData.currentStatus || 'Produced');
    const productId = productData.productId || generateProductId();
    const producer = buildProducer(productData, user);
    const origin = productData.origin || productData.productionPlace || 'Unknown origin';

    const product = new Product({
      productId,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'FOOD',
      producer,
      origin,
      expiryDate: productData.expiryDate || undefined,
      qrCode: productData.qrCode || `FOODCHAIN-${productId}`,
      status,
      history: [
        createHistoryEntry({
          actor: producer.name,
          status,
          location: origin,
          notes: productData.description || 'Product created'
        })
      ]
    });

    try {
      const txHash = await blockchainService.registerProductOnChain({
        productId: product.productId,
        name: product.name,
        origin: product.origin
      });
      product.transactionHash = txHash;
    } catch (blockchainError) {
      console.warn('Blockchain registration skipped:', blockchainError.message);
    }

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error in createProduct service:', error);
    throw error;
  }
};

// Get all products
const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map(serializeProduct);
  } catch (error) {
    console.error('Error in getAllProducts service:', error);
    throw error;
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    let product = await Product.findOne({ productId });

    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    return serializeProduct(product);
  } catch (error) {
    console.error('Error in getProductById service:', error);
    throw error;
  }
};

// Update product status
const updateProductStatus = async (productId, status, metadata = {}, user) => {
  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }

    const normalizedStatus = normalizeStatus(status);
    const actor = metadata.actor || user?.username || user?.email || 'System';
    const location = metadata.location || product.origin || 'Unknown location';

    product.status = normalizedStatus;
    product.history.push(
      createHistoryEntry({
        actor,
        status: normalizedStatus,
        location,
        notes: metadata.notes || ''
      })
    );

    try {
      const txHash = await blockchainService.updateProductStatusOnChain(
        product.productId,
        normalizedStatus,
        location
      );
      product.transactionHash = txHash;
    } catch (blockchainError) {
      console.warn('Blockchain status update skipped:', blockchainError.message);
    }

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error in updateProductStatus service:', error);
    throw error;
  }
};

// Get product history
const getProductHistory = async (productId) => {
  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }

    return serializeHistory(product.history);
  } catch (error) {
    console.error('Error in getProductHistory service:', error);
    throw error;
  }
};

/**
 * Get product traceability for QR scanning
 * This function provides complete product journey information for consumers
 * @param {string} productId - Product ID or Batch ID from QR code
 * @returns {Promise<Object>} Formatted product journey from producer to retailer
 */
const getProductTraceability = async (productId) => {
  try {
    console.log(`🔍 Getting traceability for product: ${productId}`);

    let product = await Product.findOne({ productId });

    if (!product) {
      product = await Product.findOne({ qrCode: productId });
    }

    if (!product) {
      return {
        success: false,
        message: 'Product not found',
        productId,
        verified: false
      };
    }

    let blockchainVerified = false;
    let blockchainHistory = null;

    try {
      const verificationResult = await blockchainService.verifyProductOnChain(product.productId);
      blockchainVerified = Boolean(verificationResult?.verified);

      if (blockchainVerified) {
        const historyResult = await blockchainService.getProductHistoryFromChain(product.productId);
        blockchainHistory = Array.isArray(historyResult)
          ? historyResult
          : historyResult?.history || null;
      }
    } catch (blockchainError) {
      console.warn('Blockchain verification skipped:', blockchainError.message);
    }

    const serializedProduct = serializeProduct(product);
    const journey = formatProductJourney(product, blockchainHistory);

    return {
      success: true,
      message: 'Product traceability retrieved successfully',
      verified: blockchainVerified,
      dataSource: blockchainVerified ? 'blockchain' : 'database',
      product: serializedProduct,
      journey,
      blockchainHistory,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in getProductTraceability service:', error);
    throw error;
  }
};

/**
 * Format product journey from history
 * Maps blockchain history into human-readable journey stages
 * @param {Object} product - Product document from database
 * @param {Array} blockchainHistory - History from blockchain (optional)
 * @returns {Array} Formatted journey stages
 */
const formatProductJourney = (product, blockchainHistory) => {
  const journey = [];

  if (Array.isArray(blockchainHistory) && blockchainHistory.length > 0) {
    blockchainHistory.forEach((entry, index) => {
      const status = normalizeStatus(entry.status);
      const stage = mapStatusToStage(status);
      journey.push({
        step: index + 1,
        stage: stage,
        status,
        location: entry.location,
        updatedBy: entry.updatedBy,
        timestamp: entry.date || entry.timestamp,
        description: getStageDescription(stage, status)
      });
    });
  } else {
    const history = serializeHistory(product.history);

    if (history.length > 0) {
      history.forEach((entry, index) => {
        const stage = mapStatusToStage(entry.status);
        journey.push({
          step: index + 1,
          stage,
          status: entry.status,
          location: entry.location,
          updatedBy: entry.performedBy,
          timestamp: entry.timestamp,
          description: getStageDescription(stage, entry.status)
        });
      });
    } else {
      const currentStage = mapStatusToStage(product.status);
      journey.push({
        step: 1,
        stage: currentStage,
        status: product.status,
        location: product.origin || 'Unknown',
        timestamp: product.createdAt,
        description: getStageDescription(currentStage, product.status)
      });
    }
  }

  return journey;
};

/**
 * Map status to journey stage
 * @param {string} status - Product status
 * @returns {string} Journey stage name
 */
const mapStatusToStage = (status) => {
  const statusMap = {
    Produced: 'Producer',
    InTransit: 'Distributor',
    Delivered: 'Retailer',
    InStore: 'Retailer',
    Sold: 'Consumer'
  };
  return statusMap[status] || 'Unknown';
};

/**
 * Get description for each stage
 * @param {string} stage - Journey stage
 * @param {string} status - Product status
 * @returns {string} Stage description
 */
const getStageDescription = (stage, status) => {
  const descriptions = {
    'Producer': 'Product manufactured and registered',
    'Distributor': 'Product in transit to distribution center or store',
    'Retailer': 'Product available at retail store',
    'Consumer': 'Product sold to end consumer'
  };
  return descriptions[stage] || `Product status: ${status}`;
};

/**
 * Update product (full update)
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (productId, updateData, user) => {
  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      return null;
    }

    if (updateData.name !== undefined) {
      product.name = updateData.name;
    }
    if (updateData.origin !== undefined) {
      product.origin = updateData.origin;
    }
    if (updateData.description !== undefined) {
      product.description = updateData.description;
    }
    if (updateData.category !== undefined) {
      product.category = updateData.category;
    }
    if (updateData.expiryDate !== undefined) {
      product.expiryDate = updateData.expiryDate || undefined;
    }
    if (updateData.qrCode !== undefined) {
      product.qrCode = updateData.qrCode;
    }
    if (updateData.status !== undefined) {
      product.status = normalizeStatus(updateData.status);
    }

    if (updateData.status || updateData.location || updateData.notes) {
      product.history.push(
        createHistoryEntry({
          actor: user?.username || user?.email || 'System',
          status: product.status,
          location: updateData.location || product.origin || 'Unknown location',
          notes: updateData.notes || 'Product updated'
        })
      );
    }

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Deleted product
 */
const deleteProduct = async (productId) => {
  try {
    const product = await Product.findOneAndDelete({ productId });
    return serializeProduct(product);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get product by QR Code
 * @param {string} qrCode - QR Code
 * @returns {Promise<Object>} Product with full details
 */
const getProductByQRCode = async (qrCode) => {
  try {
    const product = await Product.findOne({ qrCode });
    return serializeProduct(product);
  } catch (error) {
    console.error('Error fetching product by QR code:', error);
    throw error;
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductStatus,
  getProductHistory,
  getProductTraceability,
  updateProduct,
  deleteProduct,
  getProductByQRCode
};
