const PRIVATE_KEY_CACHE_KEY = 'tx_signing_private_key';

export const getCachedSigningPrivateKey = () => {
  return sessionStorage.getItem(PRIVATE_KEY_CACHE_KEY) || '';
};

export const cacheSigningPrivateKey = (privateKey) => {
  if (!privateKey) {
    return;
  }

  sessionStorage.setItem(PRIVATE_KEY_CACHE_KEY, privateKey.trim());
};

export const clearCachedSigningPrivateKey = () => {
  sessionStorage.removeItem(PRIVATE_KEY_CACHE_KEY);
};

export const ensureSigningPrivateKey = async () => {
  const cached = getCachedSigningPrivateKey();
  if (cached) {
    return cached;
  }

  const entered = window.prompt('Nhap private key cua vi de ky giao dich (chi dung trong phien hien tai):');
  if (!entered || !entered.trim()) {
    throw new Error('Ban can cung cap private key de ky giao dich blockchain.');
  }

  const normalized = entered.trim();
  cacheSigningPrivateKey(normalized);
  return normalized;
};

export default {
  ensureSigningPrivateKey,
  getCachedSigningPrivateKey,
  cacheSigningPrivateKey,
  clearCachedSigningPrivateKey,
};
