/**
 * Test IPFS Service with Pinata
 * Run with: node test-ipfs.js
 * 
 * Prerequisites:
 * - Pinata account created at https://pinata.cloud
 * - API keys configured in .env file
 * - npm install axios form-data
 */

const ipfsService = require('./services/ipfsService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Test Case 1: Test Pinata connection
 */
async function testPinataConnection() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Test Pinata Connection${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    const result = await ipfsService.testPinataConnection();

    if (result.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('Connection successful!');
      console.log('Message:', result.message);
      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      console.log('Message:', result.message);
      if (result.error) {
        console.log('Error:', result.error);
      }
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 2: Upload text file to IPFS
 */
async function testUploadTextFile() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: Upload Text File to IPFS${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    // Create a simple text file buffer
    const textContent = `Food Traceability System - Test File
Uploaded at: ${new Date().toISOString()}
Product: Organic Green Vegetables
Origin: Da Lat, Vietnam
Manufacturer: ABC Farm`;

    const fileBuffer = Buffer.from(textContent, 'utf-8');
    const fileName = `test-product-${Date.now()}.txt`;

    console.log('Uploading text file...');
    console.log('File name:', fileName);
    console.log('File size:', fileBuffer.length, 'bytes');

    const result = await ipfsService.uploadToIPFS(fileBuffer, fileName, {
      productType: 'vegetables',
      origin: 'Da Lat'
    });

    if (result.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nUpload Result:');
      console.log('  IPFS Hash (CID):', result.ipfsHash);
      console.log('  IPFS URL:', result.ipfsUrl);
      console.log('  File Name:', result.fileName);
      console.log('  File Size:', result.fileSize, 'bytes');
      console.log('  Timestamp:', result.timestamp);

      // Save IPFS hash for later tests
      global.testIpfsHash = result.ipfsHash;

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 3: Upload JSON metadata to IPFS
 */
async function testUploadJSON() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: Upload JSON Metadata to IPFS${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    const productMetadata = {
      productId: 'PROD-TEST-001',
      name: 'Organic Green Vegetables',
      description: 'Fresh organic vegetables from Da Lat highlands',
      category: 'Vegetables',
      origin: 'Da Lat, Lam Dong, Vietnam',
      manufacturer: 'ABC Organic Farm',
      certifications: ['Organic', 'VietGAP'],
      nutritionFacts: {
        calories: 25,
        protein: '2g',
        carbs: '5g',
        fiber: '3g'
      },
      storageInstructions: 'Store in refrigerator at 2-4°C',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedAt: new Date().toISOString()
    };

    console.log('Uploading JSON metadata...');
    console.log('Data size:', JSON.stringify(productMetadata).length, 'bytes');

    const result = await ipfsService.uploadJSONToIPFS(
      productMetadata,
      `product-metadata-${Date.now()}.json`
    );

    if (result.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nUpload Result:');
      console.log('  IPFS Hash (CID):', result.ipfsHash);
      console.log('  IPFS URL:', result.ipfsUrl);
      console.log('  Timestamp:', result.timestamp);

      // Save JSON IPFS hash for later tests
      global.testJsonIpfsHash = result.ipfsHash;

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 4: Retrieve file from IPFS
 */
async function testRetrieveFile() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: Retrieve File from IPFS${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    if (!global.testIpfsHash) {
      console.log(`${colors.yellow}⚠️  Skipping - No IPFS hash from previous test${colors.reset}`);
      return true;
    }

    console.log('Retrieving file from IPFS...');
    console.log('IPFS Hash:', global.testIpfsHash);

    const fileBuffer = await ipfsService.retrieveFromIPFS(global.testIpfsHash);

    if (fileBuffer && Buffer.isBuffer(fileBuffer)) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nRetrieved File:');
      console.log('  Size:', fileBuffer.length, 'bytes');
      console.log('  First 100 chars:', fileBuffer.toString('utf-8').substring(0, 100));

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED - Invalid buffer returned${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 5: Check pin status
 */
async function testCheckPinStatus() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 5: Check Pin Status${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    if (!global.testIpfsHash) {
      console.log(`${colors.yellow}⚠️  Skipping - No IPFS hash from previous test${colors.reset}`);
      return true;
    }

    console.log('Checking pin status...');
    console.log('IPFS Hash:', global.testIpfsHash);

    const result = await ipfsService.checkPinStatus(global.testIpfsHash);

    if (result.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nPin Status:');
      console.log('  Is Pinned:', result.isPinned ? 'Yes' : 'No');
      
      if (result.isPinned) {
        console.log('  Name:', result.name);
        console.log('  Size:', result.size, 'bytes');
        console.log('  Pinned At:', result.timestamp);
      }

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 6: Upload image (if available)
 */
async function testUploadImage() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 6: Upload Image to IPFS (Optional)${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    // Try to find any image file in the project
    const possibleImagePaths = [
      path.join(__dirname, 'test-image.jpg'),
      path.join(__dirname, 'test-image.png'),
      path.join(__dirname, '../frontend/public/logo.png'),
      path.join(__dirname, '../frontend/src/assets/logo.png')
    ];

    let imageBuffer = null;
    let imagePath = null;

    for (const testPath of possibleImagePaths) {
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        imageBuffer = fs.readFileSync(testPath);
        break;
      }
    }

    if (!imageBuffer) {
      // Create a simple test image (1x1 PNG)
      console.log('No test image found, creating dummy PNG...');
      // Minimal PNG (1x1 transparent pixel)
      imageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
      ]);
      imagePath = 'dummy-test-image.png';
    }

    const fileName = path.basename(imagePath);
    console.log('Uploading image...');
    console.log('File name:', fileName);
    console.log('File size:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    const result = await ipfsService.uploadToIPFS(imageBuffer, fileName, {
      type: 'product-image',
      category: 'test'
    });

    if (result.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nUpload Result:');
      console.log('  IPFS Hash (CID):', result.ipfsHash);
      console.log('  IPFS URL:', result.ipfsUrl);
      console.log('  File Size:', (result.fileSize / 1024).toFixed(2), 'KB');

      global.testImageIpfsHash = result.ipfsHash;

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║    IPFS Service Test Suite (Pinata)   ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nDate: ${new Date().toLocaleString()}`);

  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('  PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('  PINATA_SECRET_API_KEY:', process.env.PINATA_SECRET_API_KEY ? '✅ Set' : '❌ Not set');

  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    console.log(`\n${colors.red}❌ Pinata credentials not configured!${colors.reset}`);
    console.log('\nPlease:');
    console.log('  1. Create account at https://pinata.cloud');
    console.log('  2. Get API keys from Pinata dashboard');
    console.log('  3. Add to .env file:');
    console.log('     PINATA_API_KEY=your_api_key');
    console.log('     PINATA_SECRET_API_KEY=your_secret_key');
    process.exit(1);
  }

  // Run tests
  const results = {
    passed: 0,
    failed: 0,
    total: 6
  };

  // Test 1
  if (await testPinataConnection()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2
  if (await testUploadTextFile()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3
  if (await testUploadJSON()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4
  if (await testRetrieveFile()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 5
  if (await testCheckPinStatus()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 6
  if (await testUploadImage()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  if (global.testIpfsHash) {
    console.log(`\n${colors.cyan}📌 Test Files on IPFS:${colors.reset}`);
    console.log(`  Text File: https://gateway.pinata.cloud/ipfs/${global.testIpfsHash}`);
    if (global.testJsonIpfsHash) {
      console.log(`  JSON Metadata: https://gateway.pinata.cloud/ipfs/${global.testJsonIpfsHash}`);
    }
    if (global.testImageIpfsHash) {
      console.log(`  Image: https://gateway.pinata.cloud/ipfs/${global.testImageIpfsHash}`);
    }
  }

  console.log(`\n${colors.cyan}💡 Tip: You can view these files in any IPFS gateway:${colors.reset}`);
  console.log('  - https://gateway.pinata.cloud/ipfs/<CID>');
  console.log('  - https://ipfs.io/ipfs/<CID>');
  console.log('  - https://cloudflare-ipfs.com/ipfs/<CID>');

  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
    console.log(`\n${colors.green}✅ IPFS Service is ready to use!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ SOME TESTS FAILED${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
