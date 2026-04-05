import apiClient from './api';
import { buildSignedHeaders } from './signatureService';
import { clearCachedSigningPrivateKey, ensureSigningPrivateKey } from './txSigningClient';

const getOptionalSignedHeaders = async ({ method, path }) => {
  try {
    return await buildSignedHeaders({ method, path });
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    const missingWalletProvider = message.includes('metamask is not available') || message.includes('no wallet account connected');
    const userRejected = message.includes('user rejected') || message.includes('denied');

    if (missingWalletProvider || userRejected) {
      return {};
    }

    throw error;
  }
};

const getStoredUser = () => {
  const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const getCurrentWalletAddress = () => {
  const user = getStoredUser();
  return user?.walletAddress || null;
};

const isWalletMismatchError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('provided private key does not match your walletaddress profile') ||
    message.includes('provided private key does not match your wallet address profile') ||
    message.includes('does not match digitally signed wallet address')
  );
};

// User & Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return await apiClient.post('/users/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await apiClient.post('/users/login', credentials);
  },

  refreshToken: async (refreshToken) => {
    return await apiClient.post('/users/refresh', { refreshToken });
  },

  // Get current user profile
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    return await apiClient.get('/users');
  },

  // Update current user profile
  updateProfile: async (updates) => {
    return await apiClient.put('/users/profile', updates);
  },

  // Create user (admin only)
  createUser: async (userData) => {
    return await apiClient.post('/users', userData);
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    return await apiClient.put(`/users/${userId}`, userData);
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    return await apiClient.delete(`/users/${userId}`);
  },
};

// Product API
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    return await apiClient.get('/products');
  },

  // Get product by ID
  getProductById: async (productId) => {
    return await apiClient.get(`/products/${productId}`);
  },

  getBatchByNumber: async (batchNumber) => {
    return await apiClient.get(`/products/batch/${batchNumber}`);
  },

  // Get product by QR Code
  getProductByQRCode: async (qrCode) => {
    return await apiClient.get(`/products/qr/${encodeURIComponent(qrCode)}`);
  },

  // Create new batch (product collection is batch-first)
  createProduct: async (productData, options = {}) => {
    const walletAddress = options.walletAddress || getCurrentWalletAddress();
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey({ walletAddress });
    const headers = await getOptionalSignedHeaders({ method: 'POST', path: '/api/products' });
    try {
      return await apiClient.post('/products', productData, {
        headers: {
          ...headers,
          ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
        },
      });
    } catch (error) {
      if (isWalletMismatchError(error)) {
        clearCachedSigningPrivateKey(walletAddress);
      }
      throw error;
    }
  },

  createBatch: async (batchData, options = {}) => {
    const walletAddress = options.walletAddress || getCurrentWalletAddress();
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey({ walletAddress });
    const headers = await getOptionalSignedHeaders({ method: 'POST', path: '/api/products/batches' });
    try {
      return await apiClient.post('/products/batches', batchData, {
        headers: {
          ...headers,
          ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
        },
      });
    } catch (error) {
      if (isWalletMismatchError(error)) {
        clearCachedSigningPrivateKey(walletAddress);
      }
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    return await apiClient.put(`/products/${productId}`, productData);
  },

  // Update product status
  updateProductStatus: async (productId, status, metadata = {}, options = {}) => {
    const walletAddress = options.walletAddress || getCurrentWalletAddress();
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey({ walletAddress });
    const path = `/api/products/${productId}/status`;
    const headers = await getOptionalSignedHeaders({ method: 'PUT', path });

    try {
      return await apiClient.put(`/products/${productId}/status`, { status, ...metadata }, {
        headers: {
          ...headers,
          ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
        },
      });
    } catch (error) {
      if (isWalletMismatchError(error)) {
        clearCachedSigningPrivateKey(walletAddress);
      }
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    return await apiClient.delete(`/products/${productId}`);
  },

  // Get product history from blockchain
  getProductHistory: async (productId) => {
    return await apiClient.get(`/products/${productId}/history`);
  },

  // Get traceability payload for public QR scanning
  getTraceability: async (productId) => {
    return await apiClient.get(`/products/${productId}/traceability`);
  },

  verifyTraceability: async (productId) => {
    return await apiClient.get(`/products/${productId}/traceability/verify`);
  },

  verifyBatchTraceability: async (batchNumber) => {
    return await apiClient.get(`/products/batch/${batchNumber}/traceability/verify`);
  },
};

// Blockchain API
export const blockchainAPI = {
  // Get blockchain network info
  getNetworkInfo: async () => {
    return await apiClient.get('/blockchain/network');
  },

  // Get transaction by hash
  getTransaction: async (txHash) => {
    return await apiClient.get(`/blockchain/transaction/${txHash}`);
  },

  // Verify product on blockchain
  verifyProduct: async (productId) => {
    return await apiClient.get(`/blockchain/verify/${productId}`);
  },

  // Get all blockchain logs
  getAllLogs: async () => {
    return await apiClient.get('/blockchain/logs');
  },
};

// Export all APIs
export default {
  auth: authAPI,
  product: productAPI,
  blockchain: blockchainAPI,
};
