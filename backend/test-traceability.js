/**
 * Test Product Traceability API
 * Run with: node test-traceability.js
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:3000
 * - MongoDB connected
 * - Blockchain service initialized (optional but recommended)
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

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
 * Make HTTP request (Node.js native)
 */
async function makeRequest(url, method = 'GET', body = null) {
  const https = require('https');
  const http = require('http');
  const urlObj = new URL(url);
  const client = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Test Case 1: Get traceability for existing product
 */
async function testExistingProduct(productId) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 1: Get Traceability for Existing Product${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`Product ID: ${productId}`);

  try {
    const url = `${API_BASE_URL}/products/${productId}/traceability`;
    console.log(`Request: GET ${url}`);

    const response = await makeRequest(url);
    console.log(`Status: ${response.status}`);

    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ TEST PASSED${colors.reset}`);
      console.log('\nProduct Info:');
      console.log(`  Name: ${response.data.data.product.name}`);
      console.log(`  Origin: ${response.data.data.product.origin}`);
      console.log(`  Manufacturer: ${response.data.data.product.manufacturer}`);
      console.log(`  Current Status: ${response.data.data.product.currentStatus}`);
      
      console.log('\nVerification:');
      console.log(`  Verified: ${response.data.verified ? '✅ Yes' : '❌ No'}`);
      console.log(`  Data Source: ${response.data.dataSource}`);

      console.log('\nSupply Chain Journey:');
      response.data.data.journey.forEach(step => {
        console.log(`  ${step.step}. ${step.stage} (${step.status})`);
        console.log(`     Location: ${step.location}`);
        console.log(`     Date: ${new Date(step.timestamp).toLocaleString()}`);
      });

      if (response.data.data.blockchainHistory) {
        console.log('\nBlockchain History:');
        console.log(`  Total Records: ${response.data.data.blockchainHistory.length}`);
      }

      console.log('\nSummary:');
      console.log(`  Total Stages: ${response.data.data.summary.totalStages}`);
      console.log(`  Current Stage: ${response.data.data.summary.currentStage}`);
      console.log(`  Verified By: ${response.data.data.summary.verifiedBy}`);

      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED${colors.reset}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 2: Get traceability for non-existent product
 */
async function testNonExistentProduct() {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 2: Get Traceability for Non-Existent Product${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  const productId = 'PROD-INVALID-999';
  console.log(`Product ID: ${productId}`);

  try {
    const url = `${API_BASE_URL}/products/${productId}/traceability`;
    console.log(`Request: GET ${url}`);

    const response = await makeRequest(url);
    console.log(`Status: ${response.status}`);

    if (response.status === 404 && !response.data.success) {
      console.log(`${colors.green}✅ TEST PASSED - Product not found as expected${colors.reset}`);
      console.log(`Message: ${response.data.message}`);
      return true;
    } else {
      console.log(`${colors.red}❌ TEST FAILED - Expected 404 status${colors.reset}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 3: Test response format and fields
 */
async function testResponseFormat(productId) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 3: Validate Response Format${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    const url = `${API_BASE_URL}/products/${productId}/traceability`;
    const response = await makeRequest(url);

    if (response.status !== 200) {
      console.log(`${colors.yellow}⚠️  Skipping - Product not found${colors.reset}`);
      return true;
    }

    const data = response.data;
    const requiredFields = {
      root: ['success', 'message', 'verified', 'dataSource', 'data', 'timestamp'],
      product: ['productId', 'name', 'origin', 'manufacturer', 'currentStatus'],
      journey: ['step', 'stage', 'status', 'location', 'timestamp', 'description'],
      summary: ['totalStages', 'currentStage', 'currentStatus', 'isVerified', 'verifiedBy']
    };

    let passed = true;

    // Check root fields
    console.log('Checking root fields...');
    for (const field of requiredFields.root) {
      if (!(field in data)) {
        console.log(`  ${colors.red}❌ Missing field: ${field}${colors.reset}`);
        passed = false;
      } else {
        console.log(`  ${colors.green}✅ ${field}${colors.reset}`);
      }
    }

    // Check product fields
    if (data.data && data.data.product) {
      console.log('\nChecking product fields...');
      for (const field of requiredFields.product) {
        if (!(field in data.data.product)) {
          console.log(`  ${colors.red}❌ Missing field: ${field}${colors.reset}`);
          passed = false;
        } else {
          console.log(`  ${colors.green}✅ ${field}${colors.reset}`);
        }
      }
    }

    // Check journey fields
    if (data.data && data.data.journey && data.data.journey.length > 0) {
      console.log('\nChecking journey fields...');
      const firstStep = data.data.journey[0];
      for (const field of requiredFields.journey) {
        if (!(field in firstStep)) {
          console.log(`  ${colors.red}❌ Missing field: ${field}${colors.reset}`);
          passed = false;
        } else {
          console.log(`  ${colors.green}✅ ${field}${colors.reset}`);
        }
      }
    }

    // Check summary fields
    if (data.data && data.data.summary) {
      console.log('\nChecking summary fields...');
      for (const field of requiredFields.summary) {
        if (!(field in data.data.summary)) {
          console.log(`  ${colors.red}❌ Missing field: ${field}${colors.reset}`);
          passed = false;
        } else {
          console.log(`  ${colors.green}✅ ${field}${colors.reset}`);
        }
      }
    }

    if (passed) {
      console.log(`\n${colors.green}✅ TEST PASSED - All required fields present${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ TEST FAILED - Some fields missing${colors.reset}`);
    }

    return passed;
  } catch (error) {
    console.log(`${colors.red}❌ TEST ERROR${colors.reset}`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Test Case 4: Performance test
 */
async function testPerformance(productId) {
  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}TEST 4: Performance Test${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);

  try {
    const url = `${API_BASE_URL}/products/${productId}/traceability`;
    const iterations = 5;

    console.log(`Running ${iterations} requests...`);
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await makeRequest(url);
      const end = Date.now();
      const duration = end - start;
      times.push(duration);
      console.log(`  Request ${i + 1}: ${duration}ms`);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log('\nPerformance Results:');
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);

    if (avgTime < 1000) {
      console.log(`${colors.green}✅ TEST PASSED - Good performance (< 1s)${colors.reset}`);
      return true;
    } else if (avgTime < 3000) {
      console.log(`${colors.yellow}⚠️  WARNING - Acceptable performance (1-3s)${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}❌ POOR PERFORMANCE - Response time > 3s${colors.reset}`);
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
  console.log(`${colors.blue}║  Product Traceability API Test Suite  ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nAPI Base URL: ${API_BASE_URL}`);
  console.log(`Date: ${new Date().toLocaleString()}`);

  // Check if we have a product ID to test
  let testProductId = process.argv[2];

  if (!testProductId) {
    console.log(`\n${colors.yellow}⚠️  No product ID provided${colors.reset}`);
    console.log('Usage: node test-traceability.js PROD-001');
    console.log('\nTrying to fetch products from API...');

    try {
      const response = await makeRequest(`${API_BASE_URL}/products`);
      if (response.data.success && response.data.data.length > 0) {
        testProductId = response.data.data[0].productId;
        console.log(`${colors.green}✅ Using first product: ${testProductId}${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ No products found in database${colors.reset}`);
        console.log('Please create a product first or provide a product ID');
        process.exit(1);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Failed to fetch products${colors.reset}`);
      console.log('Error:', error.message);
      console.log('\nMake sure:');
      console.log('  1. Backend server is running');
      console.log('  2. MongoDB is connected');
      console.log('  3. At least one product exists');
      process.exit(1);
    }
  }

  // Run tests
  const results = {
    passed: 0,
    failed: 0,
    total: 4
  };

  // Test 1
  if (await testExistingProduct(testProductId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2
  if (await testNonExistentProduct()) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3
  if (await testResponseFormat(testProductId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4
  if (await testPerformance(testProductId)) {
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

  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED!${colors.reset}`);
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
