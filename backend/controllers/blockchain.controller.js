const blockchainService = require('../services/blockchain.service');

// Get blockchain network info
const getNetworkInfo = async (req, res) => {
  try {
    const info = await blockchainService.getNetworkInfo();
    
    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error fetching network info:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get transaction by hash
const getTransaction = async (req, res) => {
  try {
    const { txHash } = req.params;
    const transaction = await blockchainService.getTransaction(txHash);
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all blockchain logs
const getAllLogs = async (req, res) => {
  try {
    const logs = await blockchainService.getAllBlockchainLogs();
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify product on blockchain
const verifyProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const verification = await blockchainService.verifyProductOnChain(productId);
    
    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNetworkInfo,
  getTransaction,
  getAllLogs,
  verifyProduct
};
