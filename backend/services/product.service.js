const mongoose = require('mongoose');
const { ethers } = require('ethers');
const Product = require('../models/Product.model');
const blockchainService = require('./blockchain.service');
const { sanitizeForLog } = require('../utils/logSanitizer');
const {
  createTraceabilityProof,
  verifyTraceabilityProof
} = require('../utils/traceabilityProof');

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

const ONCHAIN_CREATE_ROLES = new Set(['ADMIN', 'MANUFACTURER']);
const STATUS_ROLE_PERMISSIONS = {
  Pending: new Set(['ADMIN']),
  Produced: new Set(['ADMIN', 'MANUFACTURER']),
  InTransit: new Set(['ADMIN', 'TRANSPORTER']),
  Delivered: new Set(['ADMIN', 'TRANSPORTER', 'STORE']),
  InStore: new Set(['ADMIN', 'STORE']),
  Sold: new Set(['ADMIN', 'STORE'])
};

const isAdminUser = (user) => String(user?.role || '').toUpperCase() === 'ADMIN';

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
  const proofVerification = verifyTraceabilityProof(product);

  return {
    ...product,
    id: product.productId,
    batchId: product.productId,
    entityType: product.entityType || 'BATCH',
    batchNumber: product.batchNumber,
    lotSize: product.lotSize,
    unit: product.unit,
    currentStatus: product.status,
    manufacturer: product.producer?.name,
    manufacturerAddress: product.producer?.address,
    relatedParties: product.relatedParties || {
      manufacturer: null,
      transporter: null,
      store: null,
      consumer: null
    },
    blockchainTxHash: product.transactionHash,
    traceabilityIntegrity: {
      isValid: proofVerification.isValid,
      reason: proofVerification.reason || null,
      payloadHash: product.traceabilityProof?.payloadHash || null,
      signerAddress: product.traceabilityProof?.signerAddress || null,
      signedAt: product.traceabilityProof?.signedAt || null
    },
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

const sanitizeRelatedParty = (party, expectedRole) => {
  if (!party) {
    return null;
  }

  return {
    userId: party.userId || party._id || undefined,
    name: party.name || party.username || undefined,
    role: expectedRole,
    walletAddress: party.walletAddress || undefined,
    company: party.company || undefined
  };
};

const generateProductId = () => `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
const generateBatchNumber = () => {
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `BMT-${randomPart}`;
};

const generateUniqueBatchNumber = async () => {
  const maxRetries = 12;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const candidate = generateBatchNumber();
    const exists = await Product.exists({ batchNumber: candidate });

    if (!exists) {
      return candidate;
    }
  }

  const fallback = `BMT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const fallbackExists = await Product.exists({ batchNumber: fallback });
  if (fallbackExists) {
    throw new Error('Unable to generate a unique batch number. Please try again.');
  }

  return fallback;
};

const parseLotSize = (value) => {
  if (value === undefined || value === null || value === '') {
    return 1;
  }

  const lotSize = Number(value);
  if (!Number.isFinite(lotSize) || lotSize < 1) {
    throw new Error('lotSize must be a positive number greater than or equal to 1.');
  }

  return Math.floor(lotSize);
};

const assertCreatePermission = (user) => {
  const role = user?.role ? String(user.role).toUpperCase() : '';

  if (!ONCHAIN_CREATE_ROLES.has(role)) {
    throw new Error('Role is not allowed to create products on-chain. Allowed roles: ADMIN, MANUFACTURER.');
  }
};

const assertStatusPermission = (user, normalizedStatus) => {
  const role = user?.role ? String(user.role).toUpperCase() : '';
  const allowedRoles = STATUS_ROLE_PERMISSIONS[normalizedStatus];

  if (!allowedRoles) {
    throw new Error(`Unsupported status for on-chain update: ${normalizedStatus}`);
  }

  if (!allowedRoles.has(role)) {
    throw new Error(`Role ${role || 'UNKNOWN'} is not allowed to set status ${normalizedStatus}.`);
  }
};

const resolveSigningOptions = (user, txOptions = {}) => {
  const signerPrivateKey = txOptions.signerPrivateKey;
  const expectedWalletAddress = txOptions.expectedWalletAddress;

  if (!signerPrivateKey) {
    throw new Error('User private key is required. Provide it in x-user-private-key header or userPrivateKey in request body.');
  }

  const wallet = new ethers.Wallet(signerPrivateKey.trim());

  if (user?.walletAddress) {
    const normalizedUserWallet = user.walletAddress.toLowerCase();
    if (wallet.address.toLowerCase() !== normalizedUserWallet) {
      throw new Error('Provided private key does not match your walletAddress profile.');
    }
  }

  if (expectedWalletAddress && wallet.address.toLowerCase() !== expectedWalletAddress.toLowerCase()) {
    throw new Error('Provided private key does not match digitally signed wallet address.');
  }

  return {
    signerPrivateKey: signerPrivateKey.trim(),
    signerAddress: wallet.address
  };
};

const findProductOrBatch = async (identifier) => {
  let product = await Product.findOne({ productId: identifier });

  if (!product) {
    product = await Product.findOne({ batchNumber: identifier });
  }

  if (!product) {
    product = await Product.findOne({ qrCode: identifier });
  }

  if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
    product = await Product.findById(identifier);
  }

  return product;
};

// Create a new batch (stored in Product collection)
const createProduct = async (productData, user, txOptions = {}) => {
  try {
    assertCreatePermission(user);
    const signingOptions = resolveSigningOptions(user, txOptions);
    const status = normalizeStatus(productData.status || productData.currentStatus || 'Produced');
    const productId = productData.productId || generateProductId();
    const batchNumber = productData.batchNumber || await generateUniqueBatchNumber();
    const producer = buildProducer(productData, user);
    const origin = productData.origin || productData.productionPlace || 'Unknown origin';
    const lotSize = parseLotSize(productData.lotSize || productData.quantity);
    const unit = productData.unit || 'unit';

    const existingBatch = await Product.findOne({ batchNumber });
    if (existingBatch) {
      throw new Error(`Batch number ${batchNumber} already exists.`);
    }

    if (!producer.address || producer.address === 'unknown-address') {
      producer.address = signingOptions.signerAddress;
    }

    const product = new Product({
      productId,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'FOOD',
      producer,
      relatedParties: {
        manufacturer: sanitizeRelatedParty(producer, 'MANUFACTURER'),
        transporter: null,
        store: null,
        consumer: null
      },
      origin,
      entityType: 'BATCH',
      batchNumber,
      lotSize,
      unit,
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
      }, signingOptions);
      product.transactionHash = txHash;
    } catch (blockchainError) {
      console.warn('Blockchain registration skipped:', blockchainError.message);
    }

    product.traceabilityProof = await createTraceabilityProof(product, signingOptions.signerPrivateKey);

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error in createProduct service:', sanitizeForLog(error));
    throw error;
  }
};

// Get all products
const getAllProducts = async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return products.map(serializeProduct);
  } catch (error) {
    console.error('Error in getAllProducts service:', sanitizeForLog(error));
    throw error;
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    const product = await findProductOrBatch(productId);

    return serializeProduct(product);
  } catch (error) {
    console.error('Error in getProductById service:', sanitizeForLog(error));
    throw error;
  }
};

// Update product status
const updateProductStatus = async (productId, status, metadata = {}, user, txOptions = {}) => {
  try {
    const normalizedStatus = normalizeStatus(status);
    assertStatusPermission(user, normalizedStatus);
    const signingOptions = resolveSigningOptions(user, txOptions);
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }
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
        location,
        signingOptions
      );
      product.transactionHash = txHash;
    } catch (blockchainError) {
      console.warn('Blockchain status update skipped:', blockchainError.message);
    }

    product.traceabilityProof = await createTraceabilityProof(product, signingOptions.signerPrivateKey);

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error in updateProductStatus service:', sanitizeForLog(error));
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
    console.error('Error in getProductHistory service:', sanitizeForLog(error));
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

    const product = await findProductOrBatch(productId);

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
    const proofStatus = verifyTraceabilityProof(product);

    return {
      success: true,
      message: 'Product traceability retrieved successfully',
      verified: blockchainVerified && proofStatus.isValid,
      proofVerified: proofStatus.isValid,
      dataSource: blockchainVerified ? 'blockchain' : 'database',
      product: serializedProduct,
      journey,
      blockchainHistory,
      integrity: {
        isValid: proofStatus.isValid,
        reason: proofStatus.reason || null,
        computedHash: proofStatus.computedHash || null,
        storedHash: proofStatus.storedHash || null,
        recoveredAddress: proofStatus.recoveredAddress || null
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in getProductTraceability service:', sanitizeForLog(error));
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

    if (updateData.relatedParties !== undefined && !isAdminUser(user)) {
      throw new Error('Only ADMIN can assign related parties.');
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
    if (updateData.batchNumber !== undefined) {
      const normalizedBatchNumber = String(updateData.batchNumber || '').trim();
      if (!normalizedBatchNumber) {
        throw new Error('batchNumber is required when provided.');
      }

      const existingBatch = await Product.findOne({
        batchNumber: normalizedBatchNumber,
        _id: { $ne: product._id }
      });

      if (existingBatch) {
        throw new Error(`Batch number ${normalizedBatchNumber} already exists.`);
      }

      product.batchNumber = normalizedBatchNumber;
    }
    if (updateData.lotSize !== undefined) {
      product.lotSize = parseLotSize(updateData.lotSize);
    }
    if (updateData.unit !== undefined) {
      product.unit = String(updateData.unit || '').trim() || 'unit';
    }
    if (updateData.qrCode !== undefined) {
      product.qrCode = updateData.qrCode;
    }
    if (updateData.status !== undefined) {
      product.status = normalizeStatus(updateData.status);
    }

    if (updateData.relatedParties && isAdminUser(user)) {
      const currentRelatedParties = product.relatedParties || {};
      product.relatedParties = {
        manufacturer: sanitizeRelatedParty(
          updateData.relatedParties.manufacturer !== undefined
            ? updateData.relatedParties.manufacturer
            : currentRelatedParties.manufacturer,
          'MANUFACTURER'
        ),
        transporter: sanitizeRelatedParty(
          updateData.relatedParties.transporter !== undefined
            ? updateData.relatedParties.transporter
            : currentRelatedParties.transporter,
          'TRANSPORTER'
        ),
        store: sanitizeRelatedParty(
          updateData.relatedParties.store !== undefined
            ? updateData.relatedParties.store
            : currentRelatedParties.store,
          'STORE'
        ),
        consumer: sanitizeRelatedParty(
          updateData.relatedParties.consumer !== undefined
            ? updateData.relatedParties.consumer
            : currentRelatedParties.consumer,
          'CONSUMER'
        )
      };
    }

    if (updateData.status || updateData.location || updateData.notes) {
      product.history.push(
        createHistoryEntry({
          actor: user?.username || user?.email || 'System',
          status: product.status,
          location: updateData.location || product.origin || 'Unknown location',
          notes: updateData.notes || 'Batch updated'
        })
      );
    }

    await product.save();
    return serializeProduct(product);
  } catch (error) {
    console.error('Error updating product:', sanitizeForLog(error));
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
    console.error('Error deleting product:', sanitizeForLog(error));
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
    console.error('Error fetching product by QR code:', sanitizeForLog(error));
    throw error;
  }
};

const getBatchByNumber = async (batchNumber) => {
  try {
    const product = await Product.findOne({ batchNumber });
    return serializeProduct(product);
  } catch (error) {
    console.error('Error fetching batch by number:', sanitizeForLog(error));
    throw error;
  }
};

const verifyTraceability = async (identifier) => {
  try {
    const product = await findProductOrBatch(identifier);

    if (!product) {
      return {
        success: false,
        message: 'Product or batch not found'
      };
    }

    const proofStatus = verifyTraceabilityProof(product);
    let blockchainVerified = false;

    try {
      const verificationResult = await blockchainService.verifyProductOnChain(product.productId);
      blockchainVerified = Boolean(verificationResult?.verified);
    } catch (blockchainError) {
      console.warn('Blockchain verification skipped:', blockchainError.message);
    }

    return {
      success: true,
      verified: proofStatus.isValid && blockchainVerified,
      proofVerified: proofStatus.isValid,
      blockchainVerified,
      identifier,
      productId: product.productId,
      batchNumber: product.batchNumber,
      signerAddress: product.traceabilityProof?.signerAddress || null,
      details: proofStatus
    };
  } catch (error) {
    console.error('Error verifying traceability:', sanitizeForLog(error));
    throw error;
  }
};

const createBatch = async (batchData, user, txOptions = {}) => {
  return createProduct(batchData, user, txOptions);
};

module.exports = {
  createProduct,
  createBatch,
  getAllProducts,
  getProductById,
  getBatchByNumber,
  updateProductStatus,
  getProductHistory,
  getProductTraceability,
  verifyTraceability,
  updateProduct,
  deleteProduct,
  getProductByQRCode
};
