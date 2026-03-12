const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Load contract ABI
const loadContractABI = (contractName) => {
  try {
    const abiPath = path.join(__dirname, '..', 'contracts', `${contractName}.json`);
    const abiFile = fs.readFileSync(abiPath, 'utf8');
    const contractData = JSON.parse(abiFile);
    return contractData.abi || contractData;
  } catch (error) {
    console.error(`Error loading ABI for ${contractName}:`, error.message);
    throw error;
  }
};

// Initialize blockchain provider
const getProvider = () => {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Get signer (wallet)
const getSigner = () => {
  const provider = getProvider();
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('Private key not found in environment variables');
  }
  
  return new ethers.Wallet(privateKey, provider);
};

// Get contract instance
const getContract = (contractName, contractAddress) => {
  try {
    const abi = loadContractABI(contractName);
    const signer = getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  } catch (error) {
    console.error(`Error initializing contract ${contractName}:`, error.message);
    throw error;
  }
};

// Get contract instance with provider only (read-only)
const getContractReadOnly = (contractName, contractAddress) => {
  try {
    const abi = loadContractABI(contractName);
    const provider = getProvider();
    return new ethers.Contract(contractAddress, abi, provider);
  } catch (error) {
    console.error(`Error initializing read-only contract ${contractName}:`, error.message);
    throw error;
  }
};

module.exports = {
  getProvider,
  getSigner,
  getContract,
  getContractReadOnly,
  loadContractABI
};
