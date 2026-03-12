const Product = require('../models/Product.model');
const blockchainService = require('./blockchain.service');
const blockchainServiceV6 = require('./blockchainService');

// Create a new product
const createProduct = async (productData) => {
  try {
    // Create product in database
    const product = new Product(productData);
    await product.save();
    
    // Register product on blockchain
    const txHash = await blockchainService.registerProductOnChain({
      productId: product.productId,
      name: product.name,
      manufacturer: product.manufacturer
    });
    
    // Update product with blockchain transaction hash
    product.blockchainTxHash = txHash;
    await product.save();
    
    return product;
  } catch (error) {
    console.error('Error in createProduct service:', error);
    throw error;
  }
};

// Get all products
const getAllProducts = async () => {
  try {
    return await Product.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getAllProducts service:', error);
    throw error;
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    return await Product.findOne({ productId });
  } catch (error) {
    console.error('Error in getProductById service:', error);
    throw error;
  }
};

// Update product status
const updateProductStatus = async (productId, status) => {
  try {
    const product = await Product.findOne({ productId });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Update status on blockchain
    const txHash = await blockchainService.updateProductStatusOnChain(productId, status);
    
    // Update product in database
    product.currentStatus = status;
    product.blockchainTxHash = txHash;
    await product.save();
    
    return product;
  } catch (error) {
    console.error('Error in updateProductStatus service:', error);
    throw error;
  }
};

// Get product history from blockchain
const getProductHistory = async (productId) => {
  try {
    return await blockchainService.getProductHistoryFromChain(productId);
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

    // Step 1: Check local MongoDB database for cached product info
    let product = await Product.findOne({ productId });
    
    let blockchainVerified = false;
    let blockchainHistory = null;

    // Step 2: If product exists in DB, try to get blockchain history
    if (product) {
      console.log('✅ Product found in database');
      
      // Try to get full history from blockchain if blockchainService is initialized
      try {
        if (blockchainServiceV6.initialized) {
          const historyResult = await blockchainServiceV6.getProductHistory(productId);
          if (historyResult.success) {
            blockchainHistory = historyResult.history;
            blockchainVerified = true;
            console.log(`✅ Retrieved ${historyResult.historyCount} blockchain history entries`);
          }
        }
      } catch (blockchainError) {
        console.warn('⚠️  Could not retrieve blockchain history:', blockchainError.error || blockchainError.message);
        // Continue with database info only
      }
    } else {
      // Step 3: If not in database, check blockchain directly
      console.log('⚠️  Product not found in database, checking blockchain...');
      
      try {
        if (blockchainServiceV6.initialized) {
          // Verify product exists on blockchain
          const verificationResult = await blockchainServiceV6.verifyProduct(productId);
          
          if (!verificationResult.verified) {
            return {
              success: false,
              message: 'Product not found in database or blockchain',
              productId: productId,
              verified: false
            };
          }

          // Get blockchain history
          const historyResult = await blockchainServiceV6.getProductHistory(productId);
          if (historyResult.success) {
            blockchainHistory = historyResult.history;
            blockchainVerified = true;
            
            // Create minimal product object from blockchain data
            product = {
              productId: productId,
              name: verificationResult.productData.name,
              origin: verificationResult.productData.origin,
              manufacturer: verificationResult.productData.manufacturer,
              currentStatus: blockchainHistory[blockchainHistory.length - 1]?.status || 'UNKNOWN',
              createdAt: verificationResult.productData.registeredDate
            };
          }
        } else {
          throw new Error('Blockchain service not initialized');
        }
      } catch (blockchainError) {
        console.error('❌ Blockchain lookup failed:', blockchainError);
        return {
          success: false,
          message: 'Product not found and blockchain service unavailable',
          productId: productId,
          error: blockchainError.error || blockchainError.message
        };
      }
    }

    // Step 4: Format the journey based on blockchain history or status
    const journey = formatProductJourney(product, blockchainHistory);

    // Step 5: Return formatted response
    return {
      success: true,
      message: 'Product traceability retrieved successfully',
      verified: blockchainVerified,
      dataSource: blockchainVerified ? 'blockchain' : 'database',
      product: {
        productId: product.productId,
        name: product.name,
        description: product.description || 'N/A',
        category: product.category || 'N/A',
        origin: product.origin,
        manufacturer: product.manufacturer,
        manufacturerAddress: product.manufacturerAddress,
        currentStatus: product.currentStatus,
        qrCode: product.qrCode,
        blockchainTxHash: product.blockchainTxHash,
        registeredDate: product.createdAt,
        lastUpdated: product.updatedAt
      },
      journey: journey,
      blockchainHistory: blockchainHistory,
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

  // If we have blockchain history, use it
  if (blockchainHistory && blockchainHistory.length > 0) {
    blockchainHistory.forEach((entry, index) => {
      const stage = mapStatusToStage(entry.status);
      journey.push({
        step: index + 1,
        stage: stage,
        status: entry.status,
        location: entry.location,
        updatedBy: entry.updatedBy,
        timestamp: entry.date,
        description: getStageDescription(stage, entry.status)
      });
    });
  } else {
    // Fallback to current status if no blockchain history
    const currentStage = mapStatusToStage(product.currentStatus);
    journey.push({
      step: 1,
      stage: currentStage,
      status: product.currentStatus,
      location: product.origin || 'Unknown',
      timestamp: product.createdAt,
      description: getStageDescription(currentStage, product.currentStatus)
    });
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
    'MANUFACTURED': 'Producer',
    'IN_TRANSIT': 'Distributor',
    'IN_STORE': 'Retailer',
    'SOLD': 'Consumer'
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
const updateProduct = async (productId, updateData) => {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('producer', 'username email company');
    
    return product;
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
    const product = await Product.findByIdAndDelete(productId);
    return product;
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
    const product = await Product.findOne({ qrCode })
      .populate('producer', 'username email company walletAddress')
      .populate('currentHolder', 'username email company');
    
    return product;
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
