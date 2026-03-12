/**
 * Initialize Blockchain Service with deployed contract
 * This file auto-loads the contract ABI and address from Truffle build artifacts
 */

const fs = require('fs');
const path = require('path');
const blockchainService = require('./blockchainService');
require('dotenv').config();

/**
 * Initialize blockchain service with deployed contract
 * @returns {Promise<Object>} Initialization result
 */
async function initializeBlockchain() {
  try {
    console.log('🚀 Initializing Blockchain Service...\n');

    // 1. Load Contract ABI from Truffle build artifacts
    const contractArtifactPath = path.join(
      __dirname,
      '../build/contracts/FoodTraceability.json'
    );

    if (!fs.existsSync(contractArtifactPath)) {
      throw new Error(
        'Contract artifact not found. Please run "npm run truffle:compile" first.'
      );
    }

    const contractArtifact = JSON.parse(
      fs.readFileSync(contractArtifactPath, 'utf8')
    );
    const contractABI = contractArtifact.abi;
    console.log('✅ Contract ABI loaded from:', contractArtifactPath);

    // 2. Load Contract Address
    let contractAddress = process.env.CONTRACT_ADDRESS;

    // Try to load from contract-address.json if not in .env
    if (!contractAddress || contractAddress === 'your_contract_address_here') {
      const addressFilePath = path.join(__dirname, '../contract-address.json');

      if (fs.existsSync(addressFilePath)) {
        const addressData = JSON.parse(
          fs.readFileSync(addressFilePath, 'utf8')
        );
        contractAddress = addressData.address;
        console.log('✅ Contract address loaded from contract-address.json');
      } else {
        throw new Error(
          'Contract address not found. Please:\n' +
          '  1. Deploy contracts: npm run truffle:migrate\n' +
          '  2. Or set CONTRACT_ADDRESS in .env file'
        );
      }
    } else {
      console.log('✅ Contract address loaded from .env');
    }

    console.log('📜 Contract Address:', contractAddress);

    // 3. Get Private Key or derive from Mnemonic
    let privateKey = process.env.PRIVATE_KEY;

    // If PRIVATE_KEY not set, derive from MNEMONIC (first account)
    if (!privateKey || privateKey === 'your_private_key_here') {
      if (process.env.MNEMONIC && process.env.MNEMONIC !== 'your_12_word_mnemonic_phrase_here') {
        const { ethers } = require('ethers');
        // Create HD wallet from mnemonic
        const wallet = ethers.Wallet.fromPhrase(process.env.MNEMONIC);
        privateKey = wallet.privateKey;
        console.log('✅ Private key derived from mnemonic');
        console.log('🔑 Using account:', wallet.address);
      } else {
        throw new Error(
          'Neither PRIVATE_KEY nor valid MNEMONIC found in .env file.\n' +
          'Please set one of them in your .env file.'
        );
      }
    } else {
      console.log('✅ Private key loaded from .env');
    }

    // Temporarily set PRIVATE_KEY for blockchainService
    process.env.PRIVATE_KEY = privateKey;

    // 4. Initialize blockchain service
    console.log('\n🔗 Connecting to blockchain...');
    const result = await blockchainService.initialize(contractABI, contractAddress);

    console.log('\n✅ Blockchain Service initialized successfully!\n');
    console.log('Network:', process.env.BLOCKCHAIN_NETWORK);
    console.log('RPC URL:', process.env.RPC_URL);
    console.log('Wallet:', result.walletAddress);
    console.log('Balance:', result.balance, 'ETH');
    console.log('Contract:', result.contractAddress);
    console.log('');

    return {
      success: true,
      message: 'Blockchain service ready',
      details: result
    };

  } catch (error) {
    console.error('\n❌ Failed to initialize blockchain service:', error.message);
    console.error('');

    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}

// Export both the init function and the service instance
module.exports = {
  initializeBlockchain,
  blockchainService
};

// Auto-initialize if this file is run directly
if (require.main === module) {
  initializeBlockchain()
    .then((result) => {
      if (result.success) {
        console.log('✅ Blockchain service is ready for use!');
        process.exit(0);
      } else {
        console.error('❌ Initialization failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}
