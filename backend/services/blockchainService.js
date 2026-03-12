/**
 * BlockchainService - Service for interacting with Ethereum Smart Contracts
 * Using ethers.js v6 and Ganache local blockchain
 */

const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize connection to Ethereum Provider (Ganache)
   * and setup contract instance
   */
  async initialize(contractABI, contractAddress) {
    try {
      // Validate environment variables
      if (!process.env.RPC_URL) {
        throw new Error('RPC_URL is not configured in .env file');
      }
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY is not configured in .env file');
      }
      if (!contractAddress) {
        throw new Error('Contract address is required');
      }

      // Connect to Ethereum Provider (Ganache)
      console.log('🔗 Connecting to blockchain at:', process.env.RPC_URL);
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

      // Test connection
      const network = await this.provider.getNetwork();
      console.log('✅ Connected to network:', network.name, `(Chain ID: ${network.chainId})`);

      // Create wallet from private key
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      console.log('🔑 Wallet address:', this.signer.address);

      // Check wallet balance
      const balance = await this.provider.getBalance(this.signer.address);
      console.log('💰 Wallet balance:', ethers.formatEther(balance), 'ETH');

      // Initialize contract instance
      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.signer
      );
      console.log('📜 Contract initialized at:', contractAddress);

      this.initialized = true;
      return {
        success: true,
        message: 'Blockchain service initialized successfully',
        walletAddress: this.signer.address,
        balance: ethers.formatEther(balance),
        contractAddress: contractAddress
      };
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      throw new Error(`Blockchain initialization failed: ${error.message}`);
    }
  }

  /**
   * Check if service is initialized
   */
  ensureInitialized() {
    if (!this.initialized || !this.contract) {
      throw new Error('BlockchainService is not initialized. Call initialize() first.');
    }
  }

  /**
   * Register a product on the blockchain
   * @param {string} name - Product name
   * @param {string} origin - Product origin/location
   * @param {string} ipfsHash - IPFS hash for additional data
   * @returns {Promise<Object>} Transaction receipt with details
   */
  async registerProduct(name, origin, ipfsHash) {
    try {
      this.ensureInitialized();

      // Validate input parameters
      if (!name || typeof name !== 'string') {
        throw new Error('Product name is required and must be a string');
      }
      if (!origin || typeof origin !== 'string') {
        throw new Error('Product origin is required and must be a string');
      }
      if (!ipfsHash || typeof ipfsHash !== 'string') {
        throw new Error('IPFS hash is required and must be a string');
      }

      console.log('📦 Registering product on blockchain...');
      console.log('   Name:', name);
      console.log('   Origin:', origin);
      console.log('   IPFS Hash:', ipfsHash);

      // Estimate gas before sending transaction
      try {
        const gasEstimate = await this.contract.registerProduct.estimateGas(
          name,
          origin,
          ipfsHash
        );
        console.log('⛽ Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.warn('⚠️  Could not estimate gas:', gasError.message);
      }

      // Call the registerProduct function on smart contract
      const tx = await this.contract.registerProduct(name, origin, ipfsHash);
      console.log('📤 Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for transaction to be mined (1 confirmation)
      const receipt = await tx.wait(1);
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Extract transaction details
      const result = {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        from: receipt.from,
        to: receipt.to,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'Success' : 'Failed',
        timestamp: new Date().toISOString(),
        productData: {
          name,
          origin,
          ipfsHash
        }
      };

      // Parse events if any
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('📋 Events emitted:', receipt.logs.length);
        result.events = receipt.logs.map((log, index) => ({
          logIndex: index,
          topics: log.topics,
          data: log.data
        }));
      }

      return result;

    } catch (error) {
      console.error('❌ Error registering product:', error);

      // Handle specific error types
      let errorMessage = error.message;
      let errorCode = 'UNKNOWN_ERROR';

      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to complete transaction';
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Cannot estimate gas. Contract function may revert.';
        errorCode = 'GAS_ESTIMATION_FAILED';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'Transaction execution reverted. Check contract logic.';
        errorCode = 'CONTRACT_REVERTED';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection error. Check if Ganache is running.';
        errorCode = 'NETWORK_ERROR';
      } else if (error.message.includes('nonce')) {
        errorMessage = 'Nonce error. Transaction may be pending.';
        errorCode = 'NONCE_ERROR';
      }

      throw {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }

  /**
   * Get current gas price from network
   */
  async getGasPrice() {
    try {
      this.ensureInitialized();
      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
      };
    } catch (error) {
      console.error('❌ Error getting gas price:', error.message);
      throw new Error(`Failed to get gas price: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    try {
      this.ensureInitialized();
      const balance = await this.provider.getBalance(this.signer.address);
      return {
        address: this.signer.address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('❌ Error getting balance:', error.message);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash) {
    try {
      this.ensureInitialized();
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found');
      }
      return tx;
    } catch (error) {
      console.error('❌ Error getting transaction:', error.message);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      this.ensureInitialized();
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber: blockNumber,
        rpcUrl: process.env.RPC_URL
      };
    } catch (error) {
      console.error('❌ Error getting network info:', error.message);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  /**
   * Get product history from blockchain
   * @param {string} productId - Product ID to get history for
   * @returns {Promise<Object>} Product history with all status updates
   */
  async getProductHistory(productId) {
    try {
      this.ensureInitialized();

      if (!productId || typeof productId !== 'string') {
        throw new Error('Product ID is required and must be a string');
      }

      console.log('📜 Getting product history from blockchain...');
      console.log('   Product ID:', productId);

      // Call smart contract to get product history
      const history = await this.contract.getProductHistory(productId);

      // Parse the history data
      // Assuming contract returns arrays: [statuses[], updaters[], timestamps[], locations[]]
      const [statuses, updaters, timestamps, locations] = history;

      // Format the history into an array of objects
      const formattedHistory = [];
      for (let i = 0; i < statuses.length; i++) {
        formattedHistory.push({
          status: statuses[i],
          updatedBy: updaters[i],
          timestamp: Number(timestamps[i]),
          date: new Date(Number(timestamps[i]) * 1000).toISOString(),
          location: locations[i]
        });
      }

      console.log('✅ Retrieved', formattedHistory.length, 'history entries');

      return {
        success: true,
        productId: productId,
        historyCount: formattedHistory.length,
        history: formattedHistory
      };

    } catch (error) {
      console.error('❌ Error getting product history:', error);

      // Handle specific errors
      let errorMessage = error.message;
      let errorCode = 'UNKNOWN_ERROR';

      if (error.message.includes('Product does not exist')) {
        errorMessage = 'Product not found on blockchain';
        errorCode = 'PRODUCT_NOT_FOUND';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMessage = 'Failed to retrieve product history from blockchain';
        errorCode = 'BLOCKCHAIN_CALL_FAILED';
      }

      throw {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
        originalError: error.message
      };
    }
  }

  /**
   * Verify product exists on blockchain
   * @param {string} productId - Product ID to verify
   * @returns {Promise<Object>} Verification result with product details
   */
  async verifyProduct(productId) {
    try {
      this.ensureInitialized();

      if (!productId || typeof productId !== 'string') {
        throw new Error('Product ID is required and must be a string');
      }

      console.log('🔍 Verifying product on blockchain...');
      console.log('   Product ID:', productId);

      // Check if product exists
      const exists = await this.contract.verifyProduct(productId);

      if (!exists) {
        return {
          success: true,
          verified: false,
          message: 'Product not found on blockchain',
          productId: productId
        };
      }

      // Get product details
      const [name, origin, ipfsHash, manufacturer, timestamp] = await this.contract.getProduct(productId);

      console.log('✅ Product verified on blockchain');

      return {
        success: true,
        verified: true,
        message: 'Product verified successfully',
        productData: {
          productId: productId,
          name: name,
          origin: origin,
          ipfsHash: ipfsHash,
          manufacturer: manufacturer,
          registeredAt: Number(timestamp),
          registeredDate: new Date(Number(timestamp) * 1000).toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error verifying product:', error);

      throw {
        success: false,
        error: error.message || 'Failed to verify product',
        errorCode: 'VERIFICATION_FAILED',
        originalError: error.message
      };
    }
  }

  /**
   * Update product status on blockchain
   * @param {string} productId - Product ID
   * @param {string} status - New status
   * @param {string} location - Current location
   * @returns {Promise<Object>} Transaction receipt
   */
  async updateProductStatus(productId, status, location) {
    try {
      this.ensureInitialized();

      if (!productId || !status || !location) {
        throw new Error('Product ID, status, and location are required');
      }

      console.log('🔄 Updating product status on blockchain...');
      console.log('   Product ID:', productId);
      console.log('   Status:', status);
      console.log('   Location:', location);

      // Call smart contract to update status
      const tx = await this.contract.updateProductStatus(productId, status, location);
      console.log('📤 Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await tx.wait(1);
      console.log('✅ Status updated in block:', receipt.blockNumber);

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'Success' : 'Failed',
        productId: productId,
        newStatus: status,
        location: location
      };

    } catch (error) {
      console.error('❌ Error updating product status:', error);
      throw {
        success: false,
        error: error.message || 'Failed to update product status',
        errorCode: 'STATUS_UPDATE_FAILED',
        originalError: error.message
      };
    }
  }

  /**
   * Close provider connection
   */
  async disconnect() {
    try {
      if (this.provider) {
        await this.provider.destroy();
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.initialized = false;
        console.log('🔌 Blockchain service disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting:', error.message);
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
