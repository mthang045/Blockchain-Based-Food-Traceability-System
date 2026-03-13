const { getProvider, getContract, getContractReadOnly } = require('../config/blockchain.config');

// Get blockchain network information
const getNetworkInfo = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    return {
      chainId: Number(network.chainId),
      name: network.name,
      blockNumber: blockNumber
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    throw error;
  }
};

// Register product on blockchain
const registerProductOnChain = async (productData) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      throw new Error('Contract address not configured');
    }
    
    const contract = getContract('FoodTraceability', contractAddress);
    
    // Call smart contract function to register product
    const tx = await contract.registerProduct(
      productData.name,
      productData.origin,
      productData.productId
    );
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error) {
    console.error('Error registering product on chain:', error);
    throw error;
  }
};

// Update product status on blockchain
const updateProductStatusOnChain = async (productId, status, location) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = getContract('FoodTraceability', contractAddress);
    
    // Call smart contract function to update status
    const tx = await contract.updateProductStatus(productId, status, location);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error) {
    console.error('Error updating product status on chain:', error);
    throw error;
  }
};

// Get product history from blockchain
const getProductHistoryFromChain = async (productId) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = getContractReadOnly('FoodTraceability', contractAddress);
    
    // Call smart contract function to get history
    const history = await contract.getProductHistory(productId);
    
    return history;
  } catch (error) {
    console.error('Error getting product history from chain:', error);
    throw error;
  }
};

// Verify product on blockchain
const verifyProductOnChain = async (productId) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = getContractReadOnly('FoodTraceability', contractAddress);
    
    // Call smart contract function to verify product
    const exists = await contract.verifyProduct(productId);
    
    if (!exists) {
      return {
        verified: false,
        message: 'Product not found on blockchain'
      };
    }
    
    const productInfo = await contract.getProduct(productId);
    
    return {
      verified: true,
      productInfo: {
        productId: productInfo.productId,
        name: productInfo.name,
        manufacturer: productInfo.manufacturer,
        timestamp: Number(productInfo.timestamp)
      }
    };
  } catch (error) {
    console.error('Error verifying product on chain:', error);
    throw error;
  }
};

// Get transaction details
const getTransaction = async (txHash) => {
  try {
    const provider = getProvider();
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);
    
    return {
      transaction: tx,
      receipt: receipt
    };
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

// Get all blockchain logs (events)
const getAllBlockchainLogs = async () => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = getContractReadOnly('FoodTraceability', contractAddress);
    
    const productRegisteredEvents = await contract.queryFilter(contract.filters.ProductRegistered());
    const statusUpdatedEvents = await contract.queryFilter(contract.filters.ProductStatusUpdated());
    const events = [...productRegisteredEvents, ...statusUpdatedEvents].sort(
      (left, right) => left.blockNumber - right.blockNumber
    );
    
    return events.map(event => ({
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      event: event.fragment.name,
      args: event.args
    }));
  } catch (error) {
    console.error('Error getting blockchain logs:', error);
    throw error;
  }
};

module.exports = {
  getNetworkInfo,
  registerProductOnChain,
  updateProductStatusOnChain,
  getProductHistoryFromChain,
  verifyProductOnChain,
  getTransaction,
  getAllBlockchainLogs
};
