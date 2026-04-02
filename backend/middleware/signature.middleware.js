const { ethers } = require('ethers');

const SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000;
const usedNonces = new Map();

const buildSignatureMessage = ({ userId, walletAddress, method, path, timestamp, nonce }) => {
  return [
    'FoodTraceability Request Authorization',
    `user:${userId}`,
    `wallet:${walletAddress.toLowerCase()}`,
    `action:${method.toUpperCase()} ${path}`,
    `timestamp:${timestamp}`,
    `nonce:${nonce}`
  ].join('\n');
};

const cleanupExpiredNonces = () => {
  const now = Date.now();
  for (const [key, expiresAt] of usedNonces.entries()) {
    if (expiresAt <= now) {
      usedNonces.delete(key);
    }
  }
};

const requireDigitalSignature = async (req, res, next) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    const signature = req.headers['x-signature'];
    const timestampHeader = req.headers['x-signature-timestamp'];
    const nonce = req.headers['x-signature-nonce'];

    if (!walletAddress || !signature || !timestampHeader || !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Missing digital signature headers. Required: x-wallet-address, x-signature, x-signature-timestamp, x-signature-nonce.'
      });
    }

    const timestamp = Number(timestampHeader);
    if (!Number.isFinite(timestamp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid x-signature-timestamp header.'
      });
    }

    const now = Date.now();
    if (Math.abs(now - timestamp) > SIGNATURE_MAX_AGE_MS) {
      return res.status(401).json({
        success: false,
        message: 'Signature has expired. Please sign a new request.'
      });
    }

    cleanupExpiredNonces();
    const nonceKey = `${walletAddress.toLowerCase()}:${nonce}`;
    if (usedNonces.has(nonceKey)) {
      return res.status(409).json({
        success: false,
        message: 'Signature nonce has already been used.'
      });
    }

    const message = buildSignatureMessage({
      userId: req.user?.id || req.user?._id?.toString() || 'unknown',
      walletAddress,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      timestamp,
      nonce
    });

    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid digital signature for provided wallet address.'
      });
    }

    if (req.user?.walletAddress && req.user.walletAddress.toLowerCase() !== recoveredAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Signed wallet does not match walletAddress in user profile.'
      });
    }

    usedNonces.set(nonceKey, now + SIGNATURE_MAX_AGE_MS);

    req.signatureAuth = {
      walletAddress: recoveredAddress,
      timestamp,
      nonce,
      message
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Failed to verify digital signature.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  requireDigitalSignature,
  buildSignatureMessage
};
