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

// Get signer from a provided private key (per-user transaction signing)
const getSignerFromPrivateKey = (privateKey) => {
  const provider = getProvider();

  if (!privateKey || typeof privateKey !== 'string') {
    throw new Error('A valid private key is required for user-signed transactions');
  }

  return new ethers.Wallet(privateKey.trim(), provider);
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

// Get contract instance signed with a provided private key
const getContractWithPrivateKey = (contractName, contractAddress, privateKey) => {
  try {
    const abi = loadContractABI(contractName);
    const signer = getSignerFromPrivateKey(privateKey);
    return new ethers.Contract(contractAddress, abi, signer);
  } catch (error) {
    console.error(`Error initializing contract ${contractName} with custom signer:`, error.message);
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
  getSignerFromPrivateKey,
  getContract,
  getContractWithPrivateKey,
  getContractReadOnly,
  loadContractABI
};
