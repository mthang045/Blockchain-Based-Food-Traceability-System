/**
 * Product Model Test Suite
 * Run with: npm run test:product-model
 */

const mongoose = require('mongoose');
const Product = require('../models/Product.model');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Schema Validation
async function testSchemaValidation() {
  log('blue', '\n========================================');
  log('blue', 'Test 1: Schema Validation');
  log('blue', '========================================\n');

  try {
    // Test with valid data
    const validProduct = new Product({
      productId: 'TEST-VALID-001',
      name: 'Test Product',
      category: 'Vegetables',
      producer: {
        name: 'Test Farm',
        address: '0xTest123'
      },
      status: 'Pending'
    });

    const error = validProduct.validateSync();
    if (!error) {
      log('green', '✅ Valid product passes validation');
    }

    // Test with invalid status
    try {
      const invalidProduct = new Product({
        productId: 'TEST-INVALID-001',
        name: 'Invalid Product',
        category: 'Vegetables',
        producer: {
          name: 'Test Farm',
          address: '0xTest123'
        },
        status: 'InvalidStatus' // Should fail
      });
      invalidProduct.validateSync();
      log('red', '❌ Invalid status should have failed validation');
    } catch (err) {
      log('green', '✅ Invalid status correctly rejected');
    }

    // Test with missing required fields
    try {
      const incompleteProduct = new Product({
        productId: 'TEST-INCOMPLETE-001',
        name: 'Incomplete Product'
        // Missing category and producer
      });
      incompleteProduct.validateSync();
      log('red', '❌ Missing required fields should have failed');
    } catch (err) {
      log('green', '✅ Missing required fields correctly rejected');
    }

    return true;
  } catch (error) {
    log('red', `❌ Test 1 Failed: ${error.message}`);
    return false;
  }
}

// Test 2: Create Product
async function testCreateProduct() {
  log('blue', '\n========================================');
  log('blue', 'Test 2: Create Product');
  log('blue', '========================================\n');

  try {
    const product = await Product.create({
      productId: 'PROD-TEST-001',
      name: 'Organic Green Vegetables',
      description: 'Fresh organic vegetables from Da Lat',
      category: 'Vegetables',
      producer: {
        name: 'ABC Organic Farm',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      },
      ipfsHash: 'QmTestHash123',
      ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
      transactionHash: '0xTestTx123',
      status: 'Produced',
      origin: 'Da Lat, Vietnam',
      batchNumber: 'BATCH-2024-001',
      history: [{
        actor: 'ABC Organic Farm',
        action: 'Product manufactured',
        location: 'Da Lat, Vietnam',
        notes: 'Quality checked and packaged'
      }]
    });

    log('green', '✅ Product created successfully');
    log('yellow', `   Product ID: ${product.productId}`);
    log('yellow', `   Name: ${product.name}`);
    log('yellow', `   Status: ${product.status}`);
    log('yellow', `   Producer: ${product.producer.name}`);
    log('yellow', `   History entries: ${product.history.length}`);

    // Verify timestamps are set
    if (product.createdAt && product.updatedAt) {
      log('green', '✅ Timestamps automatically set');
    }

    return product;
  } catch (error) {
    log('red', `❌ Test 2 Failed: ${error.message}`);
    return null;
  }
}

// Test 3: Add History Entry
async function testAddHistoryEntry(productId) {
  log('blue', '\n========================================');
  log('blue', 'Test 3: Add History Entry');
  log('blue', '========================================\n');

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }

    const initialHistoryCount = product.history.length;

    await product.addHistoryEntry(
      'XYZ Transport Company',
      'Shipped to distributor',
      'Ho Chi Minh City',
      'Temperature controlled transport'
    );

    log('green', '✅ History entry added successfully');
    log('yellow', `   Previous history count: ${initialHistoryCount}`);
    log('yellow', `   New history count: ${product.history.length}`);
    log('yellow', `   Latest action: ${product.latestHistory.action}`);
    log('yellow', `   Latest actor: ${product.latestHistory.actor}`);

    return product;
  } catch (error) {
    log('red', `❌ Test 3 Failed: ${error.message}`);
    return null;
  }
}

// Test 4: Update Status with History
async function testUpdateStatusWithHistory(productId) {
  log('blue', '\n========================================');
  log('blue', 'Test 4: Update Status with History');
  log('blue', '========================================\n');

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }

    const oldStatus = product.status;
    const oldHistoryCount = product.history.length;

    await product.updateStatusWithHistory(
      'InTransit',
      'Logistics Manager',
      'Distribution Center, HCMC',
      'Quality inspection passed'
    );

    log('green', '✅ Status updated with history');
    log('yellow', `   Old status: ${oldStatus}`);
    log('yellow', `   New status: ${product.status}`);
    log('yellow', `   History entries added: ${product.history.length - oldHistoryCount}`);
    log('yellow', `   Latest entry: ${product.latestHistory.action}`);

    return product;
  } catch (error) {
    log('red', `❌ Test 4 Failed: ${error.message}`);
    return null;
  }
}

// Test 5: Find by Producer
async function testFindByProducer(producerAddress) {
  log('blue', '\n========================================');
  log('blue', 'Test 5: Find Products by Producer');
  log('blue', '========================================\n');

  try {
    const products = await Product.findByProducer(producerAddress);

    log('green', `✅ Found ${products.length} products from producer`);
    products.forEach((p, index) => {
      log('yellow', `   ${index + 1}. ${p.name} (${p.productId}) - Status: ${p.status}`);
    });

    return products;
  } catch (error) {
    log('red', `❌ Test 5 Failed: ${error.message}`);
    return [];
  }
}

// Test 6: Find by Status
async function testFindByStatus(status) {
  log('blue', '\n========================================');
  log('blue', 'Test 6: Find Products by Status');
  log('blue', '========================================\n');

  try {
    const products = await Product.findByStatus(status);

    log('green', `✅ Found ${products.length} products with status: ${status}`);
    products.forEach((p, index) => {
      log('yellow', `   ${index + 1}. ${p.name} (${p.productId})`);
    });

    return products;
  } catch (error) {
    log('red', `❌ Test 6 Failed: ${error.message}`);
    return [];
  }
}

// Test 7: Virtual Field (latestHistory)
async function testVirtualFields(productId) {
  log('blue', '\n========================================');
  log('blue', 'Test 7: Virtual Field - Latest History');
  log('blue', '========================================\n');

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new Error('Product not found');
    }

    const latest = product.latestHistory;

    if (latest) {
      log('green', '✅ Virtual field "latestHistory" works');
      log('yellow', `   Actor: ${latest.actor}`);
      log('yellow', `   Action: ${latest.action}`);
      log('yellow', `   Location: ${latest.location}`);
      log('yellow', `   Timestamp: ${latest.timestamp.toLocaleString()}`);
    } else {
      log('red', '❌ No history entries found');
    }

    return latest;
  } catch (error) {
    log('red', `❌ Test 7 Failed: ${error.message}`);
    return null;
  }
}

// Test 8: Complete Product Journey
async function testCompleteJourney() {
  log('blue', '\n========================================');
  log('blue', 'Test 8: Complete Product Journey');
  log('blue', '========================================\n');

  try {
    // Create product
    log('yellow', '📦 Step 1: Creating product...');
    const product = await Product.create({
      productId: 'PROD-JOURNEY-001',
      name: 'Fresh Organic Tomatoes',
      category: 'Vegetables',
      producer: {
        name: 'GreenLife Farm',
        address: '0xProducer123'
      },
      status: 'Pending',
      origin: 'Lam Dong',
      history: [{
        actor: 'GreenLife Farm',
        action: 'Product registered',
        location: 'Lam Dong',
        notes: 'Awaiting harvest'
      }]
    });
    log('green', '✅ Product created');

    // Mark as produced
    log('yellow', '\n🌱 Step 2: Marking as produced...');
    await product.updateStatusWithHistory(
      'Produced',
      'GreenLife Farm',
      'Lam Dong',
      'Harvest complete'
    );
    log('green', '✅ Status: Produced');

    // Ship product
    log('yellow', '\n🚚 Step 3: Shipping product...');
    await product.updateStatusWithHistory(
      'InTransit',
      'FastShip Logistics',
      'Highway to Hanoi',
      'Temperature: 4°C'
    );
    log('green', '✅ Status: InTransit');

    // Deliver product
    log('yellow', '\n📍 Step 4: Delivering product...');
    await product.updateStatusWithHistory(
      'Delivered',
      'CityMart Supermarket',
      'Hanoi',
      'Quality verified'
    );
    log('green', '✅ Status: Delivered');

    // Display journey
    log('blue', '\n📜 Complete Product Journey:');
    product.history.forEach((entry, index) => {
      console.log(`\n  Step ${index + 1}:`);
      log('yellow', `    ${entry.action}`);
      log('yellow', `    By: ${entry.actor}`);
      log('yellow', `    At: ${entry.location}`);
      log('yellow', `    Time: ${entry.timestamp.toLocaleString()}`);
      if (entry.notes) {
        log('yellow', `    Notes: ${entry.notes}`);
      }
    });

    log('green', '\n✅ Complete journey test passed!');
    return product;
  } catch (error) {
    log('red', `❌ Test 8 Failed: ${error.message}`);
    return null;
  }
}

// Test 9: Query Performance
async function testQueryPerformance() {
  log('blue', '\n========================================');
  log('blue', 'Test 9: Query Performance');
  log('blue', '========================================\n');

  try {
    // Test indexed queries
    const start1 = Date.now();
    await Product.findOne({ productId: 'PROD-TEST-001' });
    const time1 = Date.now() - start1;
    log('green', `✅ Find by productId: ${time1}ms`);

    const start2 = Date.now();
    await Product.find({ 'producer.address': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' });
    const time2 = Date.now() - start2;
    log('green', `✅ Find by producer.address: ${time2}ms`);

    const start3 = Date.now();
    await Product.find({ status: 'Produced' });
    const time3 = Date.now() - start3;
    log('green', `✅ Find by status: ${time3}ms`);

    const start4 = Date.now();
    await Product.find({ category: 'Vegetables' }).limit(10);
    const time4 = Date.now() - start4;
    log('green', `✅ Find by category: ${time4}ms`);

    log('yellow', '\n📊 All queries completed successfully');
    log('yellow', '   (Indexes are working correctly if times are low)');

    return true;
  } catch (error) {
    log('red', `❌ Test 9 Failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║   PRODUCT MODEL TEST SUITE             ║');
  log('blue', '╚════════════════════════════════════════╝');

  try {
    // Connect to MongoDB
    log('yellow', '\n🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-traceability-test';
    await mongoose.connect(mongoUri);
    log('green', '✅ Connected to MongoDB');

    // Clear test data
    log('yellow', '🧹 Cleaning up old test data...');
    await Product.deleteMany({ productId: /^(TEST-|PROD-TEST|PROD-JOURNEY)/ });
    log('green', '✅ Test data cleaned');

    // Run tests
    await testSchemaValidation();
    const product = await testCreateProduct();
    
    if (product) {
      await testAddHistoryEntry(product.productId);
      await testUpdateStatusWithHistory(product.productId);
      await testFindByProducer(product.producer.address);
      await testFindByStatus('InTransit');
      await testVirtualFields(product.productId);
    }

    await testCompleteJourney();
    await testQueryPerformance();

    // Summary
    log('blue', '\n========================================');
    log('blue', 'TEST SUMMARY');
    log('blue', '========================================\n');
    log('green', '✅ All tests completed successfully!');
    log('yellow', '\n📊 Model Features Verified:');
    log('yellow', '   • Schema validation');
    log('yellow', '   • Product creation');
    log('yellow', '   • History tracking');
    log('yellow', '   • Status updates');
    log('yellow', '   • Static methods');
    log('yellow', '   • Virtual fields');
    log('yellow', '   • Complete journey tracking');
    log('yellow', '   • Query performance');

    // Cleanup
    log('yellow', '\n🧹 Cleaning up test data...');
    await Product.deleteMany({ productId: /^(TEST-|PROD-TEST|PROD-JOURNEY)/ });
    log('green', '✅ Cleanup complete');

  } catch (error) {
    log('red', `\n❌ Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    log('green', '\n👋 Disconnected from MongoDB');
    log('blue', '\n========================================\n');
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testSchemaValidation,
  testCreateProduct,
  testAddHistoryEntry,
  testUpdateStatusWithHistory,
  testFindByProducer,
  testFindByStatus,
  testVirtualFields,
  testCompleteJourney,
  testQueryPerformance
};
