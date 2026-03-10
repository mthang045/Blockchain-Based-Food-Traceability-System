// Mock data storage using localStorage
const STORAGE_KEYS = {
  USERS: 'foodchain_users',
  PRODUCTS: 'foodchain_products',
  SUPPLY_CHAIN: 'foodchain_supply_chain',
  BLOCKCHAIN_TXS: 'foodchain_blockchain_txs',
  CURRENT_USER: 'foodchain_current_user',
};

// Initialize with demo data
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@foodchain.vn',
        name: 'Quản trị viên',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'producer@foodchain.vn',
        name: 'Nông trại Xanh',
        role: 'producer',
        phone: '0901234567',
        address: 'Đà Lạt, Lâm Đồng',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'transporter@foodchain.vn',
        name: 'Vận tải Nhanh',
        role: 'transporter',
        phone: '0902345678',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        email: 'store@foodchain.vn',
        name: 'Siêu thị Sạch',
        role: 'store',
        phone: '0903456789',
        address: 'TP. Hồ Chí Minh',
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        email: 'consumer@foodchain.vn',
        name: 'Nguyễn Văn A',
        role: 'consumer',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUPPLY_CHAIN)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLY_CHAIN, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BLOCKCHAIN_TXS)) {
    localStorage.setItem(STORAGE_KEYS.BLOCKCHAIN_TXS, JSON.stringify([]));
  }
};

initializeStorage();

export const storageService = {
  // Users
  getUsers: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  getUserById: (id) => {
    const users = storageService.getUsers();
    return users.find((u) => u.id === id);
  },

  getUserByEmail: (email) => {
    const users = storageService.getUsers();
    return users.find((u) => u.email === email);
  },

  addUser: (user) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (id, updates) => {
    const users = storageService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  deleteUser: (id) => {
    const users = storageService.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  },

  // Products
  getProducts: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  getProductById: (id) => {
    const products = storageService.getProducts();
    return products.find((p) => p.id === id);
  },

  getProductsByProducer: (producerId) => {
    const products = storageService.getProducts();
    return products.filter((p) => p.producerId === producerId);
  },

  addProduct: (product) => {
    const products = storageService.getProducts();
    products.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  updateProduct: (id, updates) => {
    const products = storageService.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  deleteProduct: (id) => {
    const products = storageService.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  // Supply Chain
  getSupplyChainSteps: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLY_CHAIN);
    return data ? JSON.parse(data) : [];
  },

  getSupplyChainByProduct: (productId) => {
    const steps = storageService.getSupplyChainSteps();
    return steps.filter((s) => s.productId === productId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  addSupplyChainStep: (step) => {
    const steps = storageService.getSupplyChainSteps();
    steps.push(step);
    localStorage.setItem(STORAGE_KEYS.SUPPLY_CHAIN, JSON.stringify(steps));
  },

  // Blockchain Transactions
  getBlockchainTransactions: () => {
    const data = localStorage.getItem(STORAGE_KEYS.BLOCKCHAIN_TXS);
    return data ? JSON.parse(data) : [];
  },

  addBlockchainTransaction: (tx) => {
    const txs = storageService.getBlockchainTransactions();
    txs.push(tx);
    localStorage.setItem(STORAGE_KEYS.BLOCKCHAIN_TXS, JSON.stringify(txs));
  },

  // Current User
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
};
