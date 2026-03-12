/**
 * Test BlockchainService
 * Run: node test-blockchain.js
 */

const blockchainService = require('./services/blockchainService');
require('dotenv').config();

async function testBlockchainService() {
  try {
    console.log('🧪 Testing Blockchain Service...\n');
    console.log('=' .repeat(60));

    // Validate environment variables
    if (!process.env.RPC_URL) {
      throw new Error('❌ RPC_URL not found in .env file');
    }
    if (!process.env.PRIVATE_KEY) {
      throw new Error('❌ PRIVATE_KEY not found in .env file');
    }
    if (!process.env.CONTRACT_ADDRESS) {
      throw new Error('❌ CONTRACT_ADDRESS not found in .env file');
    }

    console.log('✅ Environment variables loaded');
    console.log('   RPC URL:', process.env.RPC_URL);
    console.log('   Contract Address:', process.env.CONTRACT_ADDRESS);
    console.log('=' .repeat(60));
    console.log('');

    // Load contract ABI
    console.log('📝 Loading contract ABI...');
    let contractABI;
    try {
      const contractJSON = require('./contracts/FoodTraceability.json');
      contractABI = contractJSON.abi;
      console.log('✅ ABI loaded successfully');
      console.log('   Functions:', contractABI.filter(x => x.type === 'function').length);
      console.log('   Events:', contractABI.filter(x => x.type === 'event').length);
    } catch (error) {
      throw new Error(`Failed to load ABI: ${error.message}`);
    }
    console.log('');

    // Test 1: Initialize service
    console.log('=' .repeat(60));
    console.log('TEST 1: Initialize Blockchain Service');
    console.log('=' .repeat(60));
    const initResult = await blockchainService.initialize(
      contractABI,
      process.env.CONTRACT_ADDRESS
    );
    console.log('✅ Initialization Result:');
    console.log('   Success:', initResult.success);
    console.log('   Wallet:', initResult.walletAddress);
    console.log('   Balance:', initResult.balance, 'ETH');
    console.log('   Contract:', initResult.contractAddress);
    console.log('');

    // Test 2: Get network information
    console.log('=' .repeat(60));
    console.log('TEST 2: Get Network Information');
    console.log('=' .repeat(60));
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('✅ Network Info:');
    console.log('   Chain ID:', networkInfo.chainId);
    console.log('   Network Name:', networkInfo.name);
    console.log('   Current Block:', networkInfo.blockNumber);
    console.log('   RPC URL:', networkInfo.rpcUrl);
    console.log('');

    // Test 3: Get wallet balance
    console.log('=' .repeat(60));
    console.log('TEST 3: Get Wallet Balance');
    console.log('=' .repeat(60));
    const balance = await blockchainService.getBalance();
    console.log('✅ Wallet Balance:');
    console.log('   Address:', balance.address);
    console.log('   Balance:', balance.balance, 'ETH');
    console.log('   Balance (Wei):', balance.balanceWei);
    console.log('');

    // Test 4: Get gas price
    console.log('=' .repeat(60));
    console.log('TEST 4: Get Gas Price');
    console.log('=' .repeat(60));
    const gasPrice = await blockchainService.getGasPrice();
    console.log('✅ Gas Price:');
    console.log('   Current:', gasPrice.gasPrice, 'Gwei');
    if (gasPrice.maxFeePerGas) {
      console.log('   Max Fee:', gasPrice.maxFeePerGas, 'Gwei');
    }
    console.log('');

    // Test 5: Register product on blockchain
    console.log('=' .repeat(60));
    console.log('TEST 5: Register Product on Blockchain');
    console.log('=' .repeat(60));
    
    const timestamp = Date.now();
    const productData = {
      name: `Rau xanh hữu cơ - Test ${timestamp}`,
      origin: 'Đà Lạt, Việt Nam',
      ipfsHash: `PROD-TEST-${timestamp}`
    };

    console.log('📦 Product Data:');
    console.log('   Name:', productData.name);
    console.log('   Origin:', productData.origin);
    console.log('   IPFS Hash:', productData.ipfsHash);
    console.log('');

    const txResult = await blockchainService.registerProduct(
      productData.name,
      productData.origin,
      productData.ipfsHash
    );

    console.log('✅ Transaction Result:');
    console.log('   Success:', txResult.success);
    console.log('   Transaction Hash:', txResult.transactionHash);
    console.log('   Block Number:', txResult.blockNumber);
    console.log('   Block Hash:', txResult.blockHash);
    console.log('   From:', txResult.from);
    console.log('   To:', txResult.to);
    console.log('   Gas Used:', txResult.gasUsed);
    console.log('   Status:', txResult.status);
    console.log('   Timestamp:', txResult.timestamp);
    
    if (txResult.events && txResult.events.length > 0) {
      console.log('   Events:', txResult.events.length);
    }
    console.log('');

    // Test 6: Get transaction details
    console.log('=' .repeat(60));
    console.log('TEST 6: Get Transaction Details');
    console.log('=' .repeat(60));
    const tx = await blockchainService.getTransaction(txResult.transactionHash);
    console.log('✅ Transaction Details:');
    console.log('   Hash:', tx.hash);
    console.log('   From:', tx.from);
    console.log('   To:', tx.to);
    console.log('   Value:', tx.value.toString(), 'Wei');
    console.log('   Gas Limit:', tx.gasLimit.toString());
    console.log('   Block Number:', tx.blockNumber);
    console.log('   Nonce:', tx.nonce);
    console.log('');

    // Summary
    console.log('=' .repeat(60));
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('');
    console.log('✅ Test Summary:');
    console.log('   ✓ Service initialized');
    console.log('   ✓ Network connection established');
    console.log('   ✓ Wallet balance retrieved');
    console.log('   ✓ Gas price fetched');
    console.log('   ✓ Product registered on blockchain');
    console.log('   ✓ Transaction confirmed');
    console.log('');
    console.log('🚀 BlockchainService is ready to use!');
    console.log('');

    // Cleanup
    await blockchainService.disconnect();

  } catch (error) {
    console.error('');
    console.error('=' .repeat(60));
    console.error('❌ TEST FAILED');
    console.error('=' .repeat(60));
    console.error('');
    console.error('Error:', error.message || error);
    
    if (error.errorCode) {
      console.error('Error Code:', error.errorCode);
    }
    
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    
    console.error('');
    console.error('💡 Troubleshooting Tips:');
    console.error('   1. Make sure Ganache is running on', process.env.RPC_URL || 'http://127.0.0.1:8545');
    console.error('   2. Verify .env file has correct values');
    console.error('   3. Check if contract is deployed');
    console.error('   4. Ensure wallet has enough ETH');
    console.error('   5. Read BLOCKCHAIN_SETUP.md for detailed instructions');
    console.error('');
    
    process.exit(1);
  }
}

// Run the test
console.log('');
console.log('🚀 Starting Blockchain Service Test...');
console.log('');
testBlockchainService();
