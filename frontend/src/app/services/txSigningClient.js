const PRIVATE_KEY_CACHE_KEY = 'tx_signing_private_key';
const PRIVATE_KEY_CACHE_PREFIX = 'tx_signing_private_key::';

const normalizeWalletAddress = (walletAddress) => {
  const value = String(walletAddress || '').trim().toLowerCase();
  return value || null;
};

const getCacheKey = (walletAddress) => {
  const normalizedWallet = normalizeWalletAddress(walletAddress);
  if (!normalizedWallet) {
    return PRIVATE_KEY_CACHE_KEY;
  }

  return `${PRIVATE_KEY_CACHE_PREFIX}${normalizedWallet}`;
};

export const getCachedSigningPrivateKey = (walletAddress) => {
  const scopedKey = sessionStorage.getItem(getCacheKey(walletAddress));
  if (scopedKey) {
    return scopedKey;
  }

  const legacyKey = sessionStorage.getItem(PRIVATE_KEY_CACHE_KEY) || '';
  if (legacyKey && walletAddress) {
    sessionStorage.setItem(getCacheKey(walletAddress), legacyKey);
    sessionStorage.removeItem(PRIVATE_KEY_CACHE_KEY);
    return legacyKey;
  }

  return legacyKey;
};

export const cacheSigningPrivateKey = (privateKey, walletAddress) => {
  if (!privateKey) {
    return;
  }

  sessionStorage.setItem(getCacheKey(walletAddress), privateKey.trim());
};

export const clearCachedSigningPrivateKey = (walletAddress) => {
  if (walletAddress) {
    sessionStorage.removeItem(getCacheKey(walletAddress));
    return;
  }

  sessionStorage.removeItem(PRIVATE_KEY_CACHE_KEY);
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PRIVATE_KEY_CACHE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
};

export const ensureSigningPrivateKey = async ({ walletAddress } = {}) => {
  const cached = getCachedSigningPrivateKey(walletAddress);
  if (cached) {
    return cached;
  }

  const walletHint = walletAddress ? `\nVi hien tai: ${walletAddress}` : '';
  const entered = window.prompt(`Nhap private key cua vi de ky giao dich (chi dung trong phien hien tai).${walletHint}`);
  if (!entered || !entered.trim()) {
    throw new Error('Ban can cung cap private key de ky giao dich blockchain.');
  }

  const normalized = entered.trim();
  cacheSigningPrivateKey(normalized, walletAddress);
  return normalized;
};

export default {
  ensureSigningPrivateKey,
  getCachedSigningPrivateKey,
  cacheSigningPrivateKey,
  clearCachedSigningPrivateKey,
};
