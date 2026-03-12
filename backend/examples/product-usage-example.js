/**
 * Product Model Usage Examples
 * 
 * This file demonstrates how to use the Product Mongoose schema
 * for the Food Traceability System.
 */

const Product = require('../models/Product.model');
const mongoose = require('mongoose');

// ============================================
// Example 1: Create a New Product
// ============================================
async function createProduct() {
  try {
    const product = await Product.create({
      productId: 'PROD-2024-001',
      name: 'Organic Green Vegetables',
      description: 'Fresh organic vegetables grown without pesticides',
      category: 'Vegetables',
      producer: {
        name: 'ABC Organic Farm',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      },
      ipfsHash: 'QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmX7K8...',
      transactionHash: '0x123abc...',
      status: 'Produced',
      origin: 'Da Lat, Vietnam',
      batchNumber: 'BATCH-2024-Q1-001',
      history: [{
        actor: 'ABC Organic Farm',
        action: 'Product manufactured',
        timestamp: new Date(),
        location: 'Da Lat, Vietnam',
        notes: 'Quality checked and packaged'
      }]
    });

    console.log('✅ Product created:', product.productId);
    return product;
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
  }
}

// ============================================
// Example 2: Add History Entry
// ============================================
async function addHistoryToProduct(productId) {
  try {
    const product = await Product.findOne({ productId });
    
    if (!product) {
      throw new Error('Product not found');
    }

    await product.addHistoryEntry(
      'XYZ Transport Company',
      'Shipped to distributor',
      'Ho Chi Minh City',
      'Temperature controlled transport'
    );

    console.log('✅ History entry added');
    console.log('Latest history:', product.latestHistory);
    return product;
  } catch (error) {
    console.error('❌ Error adding history:', error.message);
  }
}

// ============================================
// Example 3: Update Status with History
// ============================================
async function updateProductStatus(productId, newStatus) {
  try {
    const product = await Product.findOne({ productId });
    
    if (!product) {
      throw new Error('Product not found');
    }

    await product.updateStatusWithHistory(
      newStatus,
      'Retail Store Manager',
      'Supermarket - District 1, HCMC',
      `Product received and verified`
    );

    console.log('✅ Status updated to:', product.status);
    return product;
  } catch (error) {
    console.error('❌ Error updating status:', error.message);
  }
}

// ============================================
// Example 4: Find Products by Producer
// ============================================
async function findProductsByProducer(producerAddress) {
  try {
    const products = await Product.findByProducer(producerAddress);
    
    console.log(`✅ Found ${products.length} products from producer`);
    products.forEach(p => {
      console.log(`  - ${p.name} (${p.productId})`);
    });
    
    return products;
  } catch (error) {
    console.error('❌ Error finding products:', error.message);
  }
}

// ============================================
// Example 5: Find Products by Status
// ============================================
async function findProductsByStatus(status) {
  try {
    const products = await Product.findByStatus(status);
    
    console.log(`✅ Found ${products.length} products with status: ${status}`);
    return products;
  } catch (error) {
    console.error('❌ Error finding products:', error.message);
  }
}

// ============================================
// Example 6: Get Product with Full History
// ============================================
async function getProductHistory(productId) {
  try {
    const product = await Product.findOne({ productId });
    
    if (!product) {
      throw new Error('Product not found');
    }

    console.log(`\n📦 Product: ${product.name}`);
    console.log(`📍 Status: ${product.status}`);
    console.log(`\n📜 Supply Chain History:`);
    
    product.history.forEach((entry, index) => {
      console.log(`\n  Step ${index + 1}:`);
      console.log(`    Actor: ${entry.actor}`);
      console.log(`    Action: ${entry.action}`);
      console.log(`    Location: ${entry.location}`);
      console.log(`    Time: ${entry.timestamp.toLocaleString()}`);
      if (entry.notes) {
        console.log(`    Notes: ${entry.notes}`);
      }
    });
    
    return product;
  } catch (error) {
    console.error('❌ Error getting history:', error.message);
  }
}

// ============================================
// Example 7: Complete Product Journey
// ============================================
async function simulateCompleteJourney() {
  try {
    console.log('\n🚀 Simulating complete product journey...\n');

    // Step 1: Create product
    console.log('Step 1: Producer creates product');
    const product = await Product.create({
      productId: 'PROD-2024-DEMO',
      name: 'Fresh Organic Tomatoes',
      description: 'Vine-ripened organic tomatoes',
      category: 'Vegetables',
      producer: {
        name: 'GreenLife Farm',
        address: '0xProducer123...'
      },
      ipfsHash: 'QmDemo123...',
      transactionHash: '0xTxDemo123...',
      status: 'Produced',
      origin: 'Lam Dong Province',
      history: [{
        actor: 'GreenLife Farm',
        action: 'Product harvested and packaged',
        timestamp: new Date(),
        location: 'Lam Dong Province',
        notes: 'Organic certification verified'
      }]
    });

    console.log('✅ Product created:', product.productId);

    // Step 2: Transport
    console.log('\nStep 2: Product shipped');
    await product.updateStatusWithHistory(
      'InTransit',
      'FastShip Logistics',
      'Da Nang Warehouse',
      'Temperature: 4°C, Quality: Excellent'
    );
    console.log('✅ Status: InTransit');

    // Step 3: Arrival at distributor
    console.log('\nStep 3: Arrived at distributor');
    await product.addHistoryEntry(
      'CityMart Distribution Center',
      'Quality inspection passed',
      'Hanoi Distribution Center',
      'All products meet quality standards'
    );

    // Step 4: Delivered to retail
    console.log('\nStep 4: Delivered to retail store');
    await product.updateStatusWithHistory(
      'Delivered',
      'CityMart Supermarket',
      'CityMart - Cau Giay, Hanoi',
      'Products placed in refrigerated section'
    );
    console.log('✅ Status: Delivered');

    // Display final result
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL PRODUCT STATE');
    console.log('='.repeat(50));
    await getProductHistory(product.productId);

    return product;
  } catch (error) {
    console.error('❌ Error in journey simulation:', error.message);
  }
}

// ============================================
// Example 8: Query Products with Filters
// ============================================
async function queryProductsAdvanced() {
  try {
    // Find all vegetables that are in transit
    const inTransitVeggies = await Product.find({
      category: 'Vegetables',
      status: 'InTransit'
    }).select('productId name status createdAt');

    console.log('🥬 Vegetables in transit:', inTransitVeggies.length);

    // Find products created in last 7 days
    const recentProducts = await Product.find({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 });

    console.log('📅 Products created in last 7 days:', recentProducts.length);

    // Find products with IPFS hash
    const productsWithIPFS = await Product.find({
      ipfsHash: { $exists: true, $ne: null }
    }).countDocuments();

    console.log('🖼️ Products with IPFS images:', productsWithIPFS);

    return {
      inTransitVeggies,
      recentProducts,
      productsWithIPFS
    };
  } catch (error) {
    console.error('❌ Error querying products:', error.message);
  }
}

// ============================================
// Example 9: Bulk History Update
// ============================================
async function bulkHistoryUpdate(productIds, historyEntry) {
  try {
    const result = await Product.updateMany(
      { productId: { $in: productIds } },
      { 
        $push: { 
          history: {
            actor: historyEntry.actor,
            action: historyEntry.action,
            timestamp: new Date(),
            location: historyEntry.location,
            notes: historyEntry.notes
          }
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    return result;
  } catch (error) {
    console.error('❌ Error in bulk update:', error.message);
  }
}

// ============================================
// Example 10: Product with IPFS Integration
// ============================================
async function createProductWithIPFS(fileBuffer, productData) {
  try {
    const ipfsService = require('../services/ipfsService');

    // Upload image to IPFS
    console.log('📤 Uploading image to IPFS...');
    const ipfsResult = await ipfsService.uploadToIPFS(
      fileBuffer,
      `${productData.productId}-image.jpg`,
      {
        productId: productData.productId,
        productName: productData.name
      }
    );

    console.log('✅ IPFS Upload successful:', ipfsResult.ipfsHash);

    // Create product with IPFS data
    const product = await Product.create({
      ...productData,
      ipfsHash: ipfsResult.ipfsHash,
      ipfsUrl: ipfsResult.ipfsUrl,
      history: [{
        actor: productData.producer.name,
        action: 'Product created with image on IPFS',
        timestamp: new Date(),
        location: productData.origin,
        notes: `Image stored on IPFS: ${ipfsResult.ipfsHash}`
      }]
    });

    console.log('✅ Product created with IPFS integration');
    return product;
  } catch (error) {
    console.error('❌ Error creating product with IPFS:', error.message);
  }
}

// ============================================
// Run Examples
// ============================================
async function runExamples() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-traceability');
    console.log('✅ Connected to MongoDB\n');

    // Run demonstration
    await simulateCompleteJourney();

    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Uncomment to run:
// runExamples();

// Export functions for use in other files
module.exports = {
  createProduct,
  addHistoryToProduct,
  updateProductStatus,
  findProductsByProducer,
  findProductsByStatus,
  getProductHistory,
  simulateCompleteJourney,
  queryProductsAdvanced,
  bulkHistoryUpdate,
  createProductWithIPFS
};
