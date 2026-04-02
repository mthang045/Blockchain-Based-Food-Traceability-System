const express = require('express');
const request = require('supertest');
const { ethers } = require('ethers');

const { requireDigitalSignature } = require('../middleware/signature.middleware');
const { requireUserPrivateKey } = require('../middleware/txSigning.middleware');
const { createSignatureChallenge } = require('../controllers/product.controller');
const { createTraceabilityProof, verifyTraceabilityProof } = require('../utils/traceabilityProof');

describe('Batch signature and traceability E2E', () => {
  const wallet = ethers.Wallet.createRandom();

  const buildApp = () => {
    const app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      req.user = {
        id: 'user-e2e',
        _id: 'user-e2e',
        walletAddress: wallet.address,
        role: 'MANUFACTURER'
      };
      next();
    });

    app.post('/api/products/signature/challenge', createSignatureChallenge);

    app.post(
      '/api/products',
      requireDigitalSignature,
      requireUserPrivateKey,
      (req, res) => {
        const batch = {
          productId: 'BATCH-E2E-001',
          batchNumber: 'LOT-E2E-001',
          name: req.body.name || 'E2E Batch',
          category: req.body.category || 'FOOD',
          origin: req.body.origin || 'Test Origin',
          producer: {
            name: 'E2E Producer',
            address: wallet.address,
            userId: 'user-e2e'
          },
          lotSize: req.body.lotSize || 10,
          unit: req.body.unit || 'kg',
          status: 'Produced',
          history: [
            {
              actor: 'E2E Producer',
              action: 'Status changed to Produced',
              location: req.body.origin || 'Test Origin',
              notes: 'Batch created',
              timestamp: new Date().toISOString()
            }
          ],
          transactionHash: '0xmocktx'
        };

        res.status(201).json({
          success: true,
          data: batch
        });
      }
    );

    app.post('/api/products/traceability/verify', async (req, res) => {
      const product = req.body;
      const proof = await createTraceabilityProof(product, wallet.privateKey);
      const verification = verifyTraceabilityProof({
        ...product,
        traceabilityProof: proof
      });

      res.status(200).json({
        success: true,
        verified: verification.isValid,
        details: verification
      });
    });

    return app;
  };

  test('runs challenge -> signed batch create -> traceability verify flow', async () => {
    const app = buildApp();

    const challengeRes = await request(app)
      .post('/api/products/signature/challenge')
      .send({
        method: 'POST',
        path: '/api/products',
        walletAddress: wallet.address
      });

    expect(challengeRes.status).toBe(200);
    expect(challengeRes.body.success).toBe(true);
    expect(challengeRes.body.data.message).toContain('FoodTraceability Request Authorization');

    const signature = await wallet.signMessage(challengeRes.body.data.message);

    const createRes = await request(app)
      .post('/api/products')
      .set('x-wallet-address', wallet.address)
      .set('x-signature', signature)
      .set('x-signature-timestamp', String(challengeRes.body.data.timestamp))
      .set('x-signature-nonce', challengeRes.body.data.nonce)
      .set('x-user-private-key', wallet.privateKey)
      .send({
        name: 'E2E Rice Batch',
        origin: 'Can Tho',
        category: 'FOOD',
        lotSize: 200,
        unit: 'kg'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.batchNumber).toBe('LOT-E2E-001');

    const verifyRes = await request(app)
      .post('/api/products/traceability/verify')
      .send(createRes.body.data);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.verified).toBe(true);
  });
});
