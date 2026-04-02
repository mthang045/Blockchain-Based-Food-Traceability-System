const { authorize } = require('../middleware/auth.middleware');
const { requireUserPrivateKey } = require('../middleware/txSigning.middleware');
const productService = require('../services/product.service');

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

describe('API security and authorization', () => {
  test('returns 400 when user private key is missing', () => {
    const req = {
      headers: {},
      body: {}
    };
    const res = createMockRes();
    const next = jest.fn();

    requireUserPrivateKey(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.payload?.success).toBe(false);
    expect(res.payload?.message).toMatch(/missing user private key/i);
  });

  test('throws when provided private key does not match user walletAddress', async () => {
    const validGanachePrivateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

    await expect(
      productService.createProduct(
        {
          name: 'Test Product',
          category: 'FOOD',
          origin: 'Test Origin'
        },
        {
          role: 'MANUFACTURER',
          walletAddress: '0x0000000000000000000000000000000000000001',
          username: 'manufacturer-test'
        },
        {
          signerPrivateKey: validGanachePrivateKey
        }
      )
    ).rejects.toThrow(/does not match your walletAddress/i);
  });

  test('returns 403 when role is not allowed', () => {
    const req = {
      user: {
        role: 'CONSUMER'
      }
    };
    const res = createMockRes();
    const next = jest.fn();

    const roleGuard = authorize(['ADMIN', 'MANUFACTURER']);
    roleGuard(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.payload?.success).toBe(false);
    expect(res.payload?.message).toMatch(/do not have permission/i);
  });
});
