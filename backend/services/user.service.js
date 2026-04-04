const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const normalizeRole = (role = 'CONSUMER') => String(role).toUpperCase();

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
      role: normalizeRole(userData.role)
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
    const allowedUpdates = {
      username: updates.username,
      company: updates.company,
      walletAddress: updates.walletAddress
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
    const allowedUpdates = {
      username: updates.username,
      email: updates.email,
      role: updates.role ? normalizeRole(updates.role) : undefined,
      company: updates.company,
      walletAddress: updates.walletAddress,
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
