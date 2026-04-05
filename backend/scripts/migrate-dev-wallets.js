require('dotenv').config();

const mongoose = require('mongoose');
const connectDatabase = require('../config/database.config');
const User = require('../models/User.model');
const {
  normalizeWalletAddress,
  getDevWalletPool,
  pickAvailableWallet
} = require('../utils/devWalletPool');

const TRANSACTION_ROLES = new Set(['ADMIN', 'MANUFACTURER', 'TRANSPORTER', 'STORE']);

const normalizeRole = (role = 'CONSUMER') => String(role).toUpperCase();

const buildUsedWalletSet = async () => {
  const usedWallets = new Set();
  const users = await User.find({ walletAddress: { $exists: true, $nin: [null, ''] } }).select('walletAddress');

  for (const user of users) {
    try {
      const normalized = normalizeWalletAddress(user.walletAddress);
      if (normalized) {
        usedWallets.add(normalized.toLowerCase());
      }
    } catch (error) {
      console.warn(`Skipping invalid stored wallet address: ${user.walletAddress}`);
    }
  }

  return usedWallets;
};

const runMigration = async () => {
  const pool = getDevWalletPool();
  if (!pool.length) {
    throw new Error('No dev wallet pool configured. Set DEV_WALLET_POOL or MNEMONIC before running migration.');
  }

  const usedWallets = await buildUsedWalletSet();
  const usersWithoutWallet = await User.find({
    $or: [
      { walletAddress: { $exists: false } },
      { walletAddress: null },
      { walletAddress: '' }
    ]
  }).sort({ createdAt: 1 });

  let assignedCount = 0;
  const blockedUsers = [];

  for (const user of usersWithoutWallet) {
    const nextWallet = pickAvailableWallet(usedWallets, pool);

    if (!nextWallet) {
      const role = normalizeRole(user.role);
      if (TRANSACTION_ROLES.has(role)) {
        blockedUsers.push(`${user.email} (${role})`);
      }
      continue;
    }

    user.walletAddress = nextWallet;
    await user.save();
    usedWallets.add(nextWallet.toLowerCase());
    assignedCount += 1;
  }

  console.log(`Assigned walletAddress for ${assignedCount} user(s).`);

  if (blockedUsers.length) {
    throw new Error(
      `Unable to assign wallets to ${blockedUsers.length} transactional user(s): ${blockedUsers.join(', ')}. Increase DEV_WALLET_POOL or provide walletAddress manually.`
    );
  }

  const remaining = await User.countDocuments({
    $or: [
      { walletAddress: { $exists: false } },
      { walletAddress: null },
      { walletAddress: '' }
    ]
  });

  console.log(`Remaining users without walletAddress: ${remaining}`);
};

const main = async () => {
  try {
    await connectDatabase();
    await runMigration();
    await mongoose.disconnect();
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

main();
