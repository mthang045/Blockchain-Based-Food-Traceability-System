import { storageService } from './storage';

// Mock Blockchain Service - Simulates blockchain interactions
export const blockchainService = {
  // Generate a mock transaction hash
  generateHash: (data) => {
    const str = JSON.stringify(data) + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  },

  // Write product data to blockchain
  writeProductToBlockchain: async (productData) => {
    // Simulate blockchain write delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const txHash = blockchainService.generateHash(productData);

    const tx = {
      id: crypto.randomUUID(),
      txHash,
      type: 'product_created',
      productId: productData.id,
      data: productData,
      timestamp: new Date().toISOString(),
    };

    storageService.addBlockchainTransaction(tx);

    return txHash;
  },

  // Write supply chain step to blockchain
  writeSupplyChainToBlockchain: async (stepData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const txHash = blockchainService.generateHash(stepData);

    const tx = {
      id: crypto.randomUUID(),
      txHash,
      type: 'supply_chain_updated',
      productId: stepData.productId,
      data: stepData,
      timestamp: new Date().toISOString(),
    };

    storageService.addBlockchainTransaction(tx);

    return txHash;
  },

  // Verify data on blockchain
  verifyData: async (hash, data) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const txs = storageService.getBlockchainTransactions();
    const tx = txs.find((t) => t.txHash === hash);

    if (!tx) return false;

    // Simple verification - in real blockchain, you'd verify merkle trees, signatures, etc.
    const expectedHash = blockchainService.generateHash(tx.data);
    return expectedHash === hash;
  },

  // Read from blockchain
  readFromBlockchain: async (txHash) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const txs = storageService.getBlockchainTransactions();
    const tx = txs.find((t) => t.txHash === txHash);

    return tx ? tx.data : null;
  },

  // Get all transactions for a product
  getProductTransactions: (productId) => {
    const txs = storageService.getBlockchainTransactions();
    return txs.filter((t) => t.productId === productId);
  },
};
