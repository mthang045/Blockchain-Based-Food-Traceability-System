const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

const normalizeRole = (role = 'CONSUMER') => String(role).toUpperCase();

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
    
    // Generate JWT token
    const token = generateToken(user);
    
    return {
      user,
      token
    };
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
    
    // Generate JWT token
    const token = generateToken(user);
    
    return {
      user,
      token
    };
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

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  
  const secret = process.env.JWT_SECRET || 'your_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
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
  generateToken
};
