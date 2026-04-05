const { ethers } = require('ethers');

const DEFAULT_DEV_WALLET_POOL_SIZE = 20;

const normalizeWalletAddress = (walletAddress) => {
  if (walletAddress === undefined || walletAddress === null) {
    return null;
  }

  const rawValue = String(walletAddress).trim();
  if (!rawValue) {
    return null;
  }

  try {
    return ethers.getAddress(rawValue);
  } catch (error) {
    throw new Error(`Invalid wallet address format: ${rawValue}`);
  }
};

const parseExplicitPool = () => {
  const envValue = process.env.DEV_WALLET_POOL;
  if (!envValue || !envValue.trim()) {
    return [];
  }

  const entries = envValue
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return entries.map(normalizeWalletAddress);
};

const derivePoolFromMnemonic = () => {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic || !mnemonic.trim()) {
    return [];
  }

  const sizeRaw = Number(process.env.DEV_WALLET_POOL_SIZE);
  const poolSize = Number.isInteger(sizeRaw) && sizeRaw > 0 ? sizeRaw : DEFAULT_DEV_WALLET_POOL_SIZE;

  const hdRoot = ethers.HDNodeWallet.fromPhrase(mnemonic.trim(), undefined, 'm');
  const pool = [];

  for (let index = 0; index < poolSize; index += 1) {
    const wallet = hdRoot.derivePath(`44'/60'/0'/0/${index}`);
    pool.push(wallet.address);
  }

  return pool;
};

const getDevWalletPool = () => {
  const explicitPool = parseExplicitPool();
  if (explicitPool.length > 0) {
    return explicitPool;
  }

  return derivePoolFromMnemonic();
};

const pickAvailableWallet = (usedWalletSet = new Set(), pool = []) => {
  for (const walletAddress of pool) {
    if (!usedWalletSet.has(walletAddress.toLowerCase())) {
      return walletAddress;
    }
  }

  return null;
};

module.exports = {
  normalizeWalletAddress,
  getDevWalletPool,
  pickAvailableWallet,
  DEFAULT_DEV_WALLET_POOL_SIZE
};
