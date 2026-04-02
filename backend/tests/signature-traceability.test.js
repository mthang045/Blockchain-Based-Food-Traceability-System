const { ethers } = require('ethers');
const {
  buildSignatureMessage,
  requireDigitalSignature
} = require('../middleware/signature.middleware');
const {
  createTraceabilityProof,
  verifyTraceabilityProof
} = require('../utils/traceabilityProof');

const createMockRes = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    }
  };

  return res;
};

describe('Digital signature middleware', () => {
  test('accepts valid request signature', async () => {
    const wallet = ethers.Wallet.createRandom();
    const timestamp = Date.now();
    const nonce = `nonce-${Date.now()}`;
    const path = '/api/products';

    const message = buildSignatureMessage({
      userId: 'user-1',
      walletAddress: wallet.address,
      method: 'POST',
      path,
      timestamp,
      nonce
    });
    const signature = await wallet.signMessage(message);

    const req = {
      method: 'POST',
      originalUrl: path,
      headers: {
        'x-wallet-address': wallet.address,
        'x-signature': signature,
        'x-signature-timestamp': String(timestamp),
        'x-signature-nonce': nonce
      },
      user: {
        id: 'user-1',
        walletAddress: wallet.address
      }
    };

    const res = createMockRes();
    const next = jest.fn();

    await requireDigitalSignature(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.signatureAuth.walletAddress.toLowerCase()).toBe(wallet.address.toLowerCase());
  });

  test('rejects replayed nonce', async () => {
    const wallet = ethers.Wallet.createRandom();
    const timestamp = Date.now();
    const nonce = `replay-${Date.now()}`;
    const path = '/api/products';

    const message = buildSignatureMessage({
      userId: 'user-2',
      walletAddress: wallet.address,
      method: 'POST',
      path,
      timestamp,
      nonce
    });
    const signature = await wallet.signMessage(message);

    const baseReq = {
      method: 'POST',
      originalUrl: path,
      headers: {
        'x-wallet-address': wallet.address,
        'x-signature': signature,
        'x-signature-timestamp': String(timestamp),
        'x-signature-nonce': nonce
      },
      user: {
        id: 'user-2',
        walletAddress: wallet.address
      }
    };

    const firstRes = createMockRes();
    const secondRes = createMockRes();
    const firstNext = jest.fn();
    const secondNext = jest.fn();

    await requireDigitalSignature(baseReq, firstRes, firstNext);
    await requireDigitalSignature({ ...baseReq }, secondRes, secondNext);

    expect(firstNext).toHaveBeenCalledTimes(1);
    expect(secondNext).not.toHaveBeenCalled();
    expect(secondRes.statusCode).toBe(409);
  });
});

describe('Traceability proof integrity', () => {
  test('verifies valid traceability proof and detects tampering', async () => {
    const wallet = ethers.Wallet.createRandom();
    const product = {
      productId: 'BATCH-TEST-001',
      batchNumber: 'LOT-TEST-001',
      name: 'Coffee Beans',
      category: 'FOOD',
      origin: 'Da Lat',
      producer: {
        name: 'Farm A',
        address: wallet.address,
        userId: 'u-1'
      },
      lotSize: 120,
      unit: 'kg',
      status: 'Produced',
      transactionHash: null,
      history: [
        {
          actor: 'Farm A',
          action: 'Status changed to Produced',
          location: 'Da Lat',
          notes: 'Initial batch',
          timestamp: new Date('2026-04-02T10:00:00.000Z')
        }
      ]
    };

    const proof = await createTraceabilityProof(product, wallet.privateKey);
    const validResult = verifyTraceabilityProof({
      ...product,
      traceabilityProof: proof
    });

    expect(validResult.isValid).toBe(true);

    const tamperedResult = verifyTraceabilityProof({
      ...product,
      status: 'Sold',
      traceabilityProof: proof
    });

    expect(tamperedResult.isValid).toBe(false);
    expect(tamperedResult.reason).toMatch(/hash mismatch/i);
  });
});
