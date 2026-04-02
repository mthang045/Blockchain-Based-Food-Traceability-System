const crypto = require('crypto');
const { ethers } = require('ethers');

const normalizeObject = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => normalizeObject(item));
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  return Object.keys(input)
    .sort()
    .reduce((acc, key) => {
      acc[key] = normalizeObject(input[key]);
      return acc;
    }, {});
};

const buildTraceabilityPayload = (product) => {
  return normalizeObject({
    productId: product.productId,
    batchNumber: product.batchNumber,
    name: product.name,
    category: product.category,
    origin: product.origin,
    producer: {
      name: product.producer?.name,
      address: product.producer?.address,
      userId: product.producer?.userId
    },
    lotSize: product.lotSize,
    unit: product.unit,
    status: product.status,
    transactionHash: product.transactionHash || null,
    history: (product.history || []).map((entry) => ({
      actor: entry.actor,
      action: entry.action,
      location: entry.location,
      notes: entry.notes || '',
      timestamp: new Date(entry.timestamp).toISOString()
    }))
  });
};

const hashPayload = (payload) => {
  const jsonPayload = JSON.stringify(payload);
  return crypto.createHash('sha256').update(jsonPayload).digest('hex');
};

const createTraceabilityProof = async (product, signerPrivateKey) => {
  const payload = buildTraceabilityPayload(product);
  const payloadHash = hashPayload(payload);
  const wallet = new ethers.Wallet(signerPrivateKey.trim());
  const signature = await wallet.signMessage(payloadHash);

  return {
    payloadHash,
    signature,
    signerAddress: wallet.address,
    signedAt: new Date(),
    algorithm: 'ETH_PERSONAL_SIGN_SHA256'
  };
};

const verifyTraceabilityProof = (product) => {
  if (!product?.traceabilityProof?.payloadHash || !product?.traceabilityProof?.signature) {
    return {
      isValid: false,
      reason: 'Missing traceability proof'
    };
  }

  const payload = buildTraceabilityPayload(product);
  const computedHash = hashPayload(payload);
  const storedHash = product.traceabilityProof.payloadHash;

  if (computedHash !== storedHash) {
    return {
      isValid: false,
      reason: 'Payload hash mismatch',
      computedHash,
      storedHash
    };
  }

  const recoveredAddress = ethers.verifyMessage(storedHash, product.traceabilityProof.signature);
  const expectedSigner = (product.traceabilityProof.signerAddress || '').toLowerCase();

  if (!expectedSigner || recoveredAddress.toLowerCase() !== expectedSigner) {
    return {
      isValid: false,
      reason: 'Signature does not match signer address',
      recoveredAddress
    };
  }

  return {
    isValid: true,
    computedHash,
    storedHash,
    recoveredAddress
  };
};

module.exports = {
  buildTraceabilityPayload,
  hashPayload,
  createTraceabilityProof,
  verifyTraceabilityProof
};
