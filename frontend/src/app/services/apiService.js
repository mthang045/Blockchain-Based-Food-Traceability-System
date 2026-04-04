import apiClient from './api';
import { buildSignedHeaders } from './signatureService';
import { ensureSigningPrivateKey } from './txSigningClient';

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
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey();
    const headers = await buildSignedHeaders({ method: 'POST', path: '/api/products' });
    return await apiClient.post('/products', productData, {
      headers: {
        ...headers,
        ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
      },
    });
  },

  createBatch: async (batchData, options = {}) => {
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey();
    const headers = await buildSignedHeaders({ method: 'POST', path: '/api/products/batches' });
    return await apiClient.post('/products/batches', batchData, {
      headers: {
        ...headers,
        ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
      },
    });
  },

  // Update product
  updateProduct: async (productId, productData) => {
    return await apiClient.put(`/products/${productId}`, productData);
  },

  // Update product status
  updateProductStatus: async (productId, status, metadata = {}, options = {}) => {
    const userPrivateKey = options.userPrivateKey || await ensureSigningPrivateKey();
    const path = `/api/products/${productId}/status`;
    const headers = await buildSignedHeaders({ method: 'PUT', path });

    return await apiClient.put(`/products/${productId}/status`, { status, ...metadata }, {
      headers: {
        ...headers,
        ...(userPrivateKey ? { 'x-user-private-key': userPrivateKey } : {}),
      },
    });
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
