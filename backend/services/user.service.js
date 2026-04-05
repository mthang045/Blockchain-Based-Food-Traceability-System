const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  normalizeWalletAddress,
  getDevWalletPool,
  pickAvailableWallet
} = require('../utils/devWalletPool');

const normalizeRole = (role = 'CONSUMER') => String(role).toUpperCase();
const TRANSACTION_ROLES = new Set(['ADMIN', 'MANUFACTURER', 'TRANSPORTER', 'STORE']);

const isTransactionalRole = (role) => TRANSACTION_ROLES.has(normalizeRole(role));

const getUsedWalletSet = async () => {
  const usersWithWallet = await User.find({
    walletAddress: { $exists: true, $nin: [null, ''] }
  }).select('walletAddress');

  const usedWallets = new Set();
  for (const user of usersWithWallet) {
    const normalized = normalizeWalletAddress(user.walletAddress);
    if (normalized) {
      usedWallets.add(normalized.toLowerCase());
    }
  }

  return usedWallets;
};

const ensureWalletUnique = async (walletAddress, excludeUserId = null) => {
  if (!walletAddress) {
    return;
  }

  const query = {
    walletAddress: { $regex: `^${walletAddress}$`, $options: 'i' }
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingWalletOwner = await User.findOne(query).select('_id');
  if (existingWalletOwner) {
    throw new Error('Wallet address is already assigned to another account.');
  }
};

const allocateWalletFromDevPool = async () => {
  const pool = getDevWalletPool();
  if (!pool.length) {
    return null;
  }

  const usedWallets = await getUsedWalletSet();
  return pickAvailableWallet(usedWallets, pool);
};

const resolveWalletAddressForCreate = async ({ role, walletAddress }) => {
  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (normalizedWallet) {
    await ensureWalletUnique(normalizedWallet);
    return normalizedWallet;
  }

  const assignedWallet = await allocateWalletFromDevPool();
  if (assignedWallet) {
    return assignedWallet;
  }

  if (isTransactionalRole(role)) {
    throw new Error('Transactional roles require walletAddress. No available address in DEV_WALLET_POOL.');
  }

  return null;
};

const assertRoleWalletRequirement = (role, walletAddress) => {
  if (isTransactionalRole(role) && !walletAddress) {
    throw new Error('walletAddress is required for transactional roles: ADMIN, MANUFACTURER, TRANSPORTER, STORE.');
  }
};

const getAccessTokenSecret = () => process.env.JWT_SECRET || 'your_jwt_secret';
const getAccessTokenExpiry = () => process.env.JWT_EXPIRES_IN || '7d';
const getRefreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || getAccessTokenSecret();
const getRefreshTokenExpiry = () => process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const parseExpiresToDate = (expiresInValue) => {
  if (typeof expiresInValue === 'number') {
    return new Date(Date.now() + expiresInValue * 1000);
  }

  if (typeof expiresInValue !== 'string') {
    return null;
  }

  const normalized = expiresInValue.trim();
  const directNumber = Number(normalized);
  if (!Number.isNaN(directNumber)) {
    return new Date(Date.now() + directNumber * 1000);
  }

  const match = normalized.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplierByUnit = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return new Date(Date.now() + value * multiplierByUnit[unit]);
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    type: 'refresh'
  };

  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: getRefreshTokenExpiry() });
};

const issueSessionTokens = async (user) => {
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = parseExpiresToDate(getRefreshTokenExpiry());
  await user.save();

  return {
    user,
    token,
    refreshToken
  };
};

// Register new user
const registerUser = async (userData) => {
  try {
    const normalizedRole = normalizeRole(userData.role);
    const resolvedWalletAddress = await resolveWalletAddressForCreate({
      role: normalizedRole,
      walletAddress: userData.walletAddress
    });

    assertRoleWalletRequirement(normalizedRole, resolvedWalletAddress);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    });
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user
    const user = new User({
      ...userData,
      role: normalizedRole,
      walletAddress: resolvedWalletAddress || undefined
    });
    await user.save();
    
    return await issueSessionTokens(user);
  } catch (error) {
    console.error('Error in registerUser service:', error);
    throw error;
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    return await issueSessionTokens(user);
  } catch (error) {
    console.error('Error in loginUser service:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    console.error('Error in getUserById service:', error);
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    return await User.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getAllUsers service:', error);
    throw error;
  }
};

const updateProfile = async (userId, updates) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const hasWalletInPayload = Object.prototype.hasOwnProperty.call(updates, 'walletAddress');
    const normalizedWallet = hasWalletInPayload
      ? normalizeWalletAddress(updates.walletAddress)
      : normalizeWalletAddress(currentUser.walletAddress);

    assertRoleWalletRequirement(currentUser.role, normalizedWallet);
    await ensureWalletUnique(normalizedWallet, userId);

    const allowedUpdates = {
      username: updates.username,
      company: updates.company,
      walletAddress: hasWalletInPayload ? normalizedWallet : undefined
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    return await User.findByIdAndUpdate(userId, allowedUpdates, {
      new: true,
      runValidators: true
    });
  } catch (error) {
    console.error('Error in updateProfile service:', error);
    throw error;
  }
};

const createUser = async (userData) => {
  return registerUser(userData);
};

const updateUser = async (userId, updates) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return null;
    }

    const nextRole = updates.role ? normalizeRole(updates.role) : normalizeRole(currentUser.role);
    const hasWalletInPayload = Object.prototype.hasOwnProperty.call(updates, 'walletAddress');
    const nextWalletAddress = hasWalletInPayload
      ? normalizeWalletAddress(updates.walletAddress)
      : normalizeWalletAddress(currentUser.walletAddress);

    assertRoleWalletRequirement(nextRole, nextWalletAddress);
    await ensureWalletUnique(nextWalletAddress, userId);

    const allowedUpdates = {
      username: updates.username,
      email: updates.email,
      role: updates.role ? nextRole : undefined,
      company: updates.company,
      walletAddress: hasWalletInPayload ? nextWalletAddress : undefined,
      isActive: updates.isActive
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    return await User.findByIdAndUpdate(userId, allowedUpdates, {
      new: true,
      runValidators: true
    });
  } catch (error) {
    console.error('Error in updateUser service:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error('Error in deleteUser service:', error);
    throw error;
  }
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }

  if (decoded?.type !== 'refresh' || !decoded?.id) {
    throw new Error('Invalid refresh token payload');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  const incomingHash = hashToken(refreshToken);
  if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
    throw new Error('Refresh token does not match current session');
  }

  if (user.refreshTokenExpiresAt && new Date(user.refreshTokenExpiresAt).getTime() < Date.now()) {
    throw new Error('Refresh token has expired');
  }

  return await issueSessionTokens(user);
};

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  
  const secret = getAccessTokenSecret();
  const expiresIn = getAccessTokenExpiry();
  
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateProfile,
  createUser,
  updateUser,
  deleteUser,
  generateToken,
  refreshAccessToken
};
