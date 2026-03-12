# BlockchainService - Hướng dẫn sử dụng

## 📋 Tổng quan

`blockchainService.js` là service dùng để giao tiếp với Smart Contract trên Ethereum (Ganache) sử dụng **ethers.js version 6**.

## 🚀 Cài đặt

### 1. Cài đặt ethers.js v6

```bash
cd backend
npm install ethers@6
```

### 2. Cấu hình .env

Tạo file `.env` trong thư mục `backend/`:

```env
# Blockchain Configuration cho Ganache
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_FROM_GANACHE
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### 3. Lấy Private Key từ Ganache

**Cách 1: Ganache GUI**
1. Mở Ganache Desktop
2. Chọn một account (ví dụ: Account 0)
3. Click vào biểu tượng 🔑 (key icon)
4. Copy Private Key

**Cách 2: Ganache CLI**
```bash
ganache-cli

# Output sẽ hiển thị:
# Available Accounts
# ==================
# (0) 0x1234... (100 ETH)
# 
# Private Keys
# ==================
# (0) 0xabcdef123456...
```

## 📝 Cách sử dụng

### Initialize Service

```javascript
const blockchainService = require('./services/blockchainService');

// Load contract ABI
const contractABI = require('./contracts/FoodTraceability.json').abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Initialize service
try {
  const result = await blockchainService.initialize(contractABI, contractAddress);
  console.log('✅ Blockchain service ready:', result);
} catch (error) {
  console.error('❌ Failed to initialize:', error.message);
}
```

### Register Product

```javascript
// Register a new product on blockchain
try {
  const result = await blockchainService.registerProduct(
    'Rau xanh hữu cơ',           // name
    'Đà Lạt, Việt Nam',          // origin
    'QmX1234567890abcdefghij'   // ipfsHash (hoặc productId)
  );

  console.log('Transaction Hash:', result.transactionHash);
  console.log('Block Number:', result.blockNumber);
  console.log('Gas Used:', result.gasUsed);
} catch (error) {
  console.error('Error:', error.error);
  console.error('Error Code:', error.errorCode);
}
```

### Get Network Info

```javascript
const networkInfo = await blockchainService.getNetworkInfo();
console.log('Chain ID:', networkInfo.chainId);
console.log('Current Block:', networkInfo.blockNumber);
```

### Get Wallet Balance

```javascript
const balance = await blockchainService.getBalance();
console.log('Address:', balance.address);
console.log('Balance:', balance.balance, 'ETH');
```

### Get Gas Price

```javascript
const gasPrice = await blockchainService.getGasPrice();
console.log('Gas Price:', gasPrice.gasPrice, 'Gwei');
```

## 🎯 Ví dụ: Tích hợp vào Express Route

```javascript
// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

router.post('/register', async (req, res) => {
  try {
    const { name, origin, productId } = req.body;

    // Register on blockchain
    const txResult = await blockchainService.registerProduct(
      name,
      origin,
      productId
    );

    // Save to database (MongoDB)
    const product = await Product.create({
      name,
      origin,
      productId,
      blockchainTxHash: txResult.transactionHash,
      blockNumber: txResult.blockNumber,
      status: 'REGISTERED'
    });

    res.status(201).json({
      success: true,
      message: 'Product registered successfully',
      data: {
        product,
        blockchain: txResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.error || error.message,
      errorCode: error.errorCode
    });
  }
});

module.exports = router;
```

## 🎯 Ví dụ: Initialize trong server.js

```javascript
// server.js
const express = require('express');
const blockchainService = require('./services/blockchainService');

const app = express();

// Initialize blockchain service on server start
async function startServer() {
  try {
    // Load contract ABI
    const contractABI = require('./contracts/FoodTraceability.json').abi;
    
    // Initialize blockchain service
    await blockchainService.initialize(
      contractABI,
      process.env.CONTRACT_ADDRESS
    );
    console.log('✅ Blockchain service initialized');

    // Start Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
```

## 🔧 Smart Contract Example

Service này kỳ vọng Smart Contract có function:

```solidity
// FoodTraceability.sol
pragma solidity ^0.8.0;

contract FoodTraceability {
    event ProductRegistered(
        address indexed manufacturer,
        string name,
        string origin,
        string ipfsHash,
        uint256 timestamp
    );

    function registerProduct(
        string memory name,
        string memory origin,
        string memory ipfsHash
    ) public {
        emit ProductRegistered(
            msg.sender,
            name,
            origin,
            ipfsHash,
            block.timestamp
        );
        
        // Your business logic here
    }
}
```

## ⚠️ Error Handling

Service xử lý các lỗi phổ biến:

| Error Code | Mô tả | Cách khắc phục |
|------------|-------|----------------|
| `INSUFFICIENT_FUNDS` | Không đủ ETH | Chuyển ETH vào wallet |
| `GAS_ESTIMATION_FAILED` | Không ước tính được gas | Kiểm tra contract function |
| `CONTRACT_REVERTED` | Transaction bị revert | Kiểm tra logic contract |
| `NETWORK_ERROR` | Lỗi kết nối | Kiểm tra Ganache đang chạy |
| `NONCE_ERROR` | Lỗi nonce | Đợi transaction pending hoàn thành |

## 🧪 Testing

```javascript
// test/blockchainService.test.js
const blockchainService = require('../services/blockchainService');

describe('BlockchainService', () => {
  beforeAll(async () => {
    const abi = [...]; // Your ABI
    await blockchainService.initialize(abi, process.env.CONTRACT_ADDRESS);
  });

  test('should register product', async () => {
    const result = await blockchainService.registerProduct(
      'Test Product',
      'Test Origin',
      'test-hash-123'
    );
    
    expect(result.success).toBe(true);
    expect(result.transactionHash).toBeDefined();
  });

  afterAll(async () => {
    await blockchainService.disconnect();
  });
});
```

## 🐛 Troubleshooting

### Lỗi: "RPC_URL is not configured"
- Kiểm tra file `.env` có `RPC_URL`
- Đảm bảo Ganache đang chạy trên port 8545

### Lỗi: "Insufficient funds"
- Wallet không có ETH
- Sử dụng account từ Ganache (mặc định có 100 ETH)

### Lỗi: "Network connection error"
```bash
# Kiểm tra Ganache đang chạy
curl http://127.0.0.1:8545
```

### Lỗi: "Contract address is required"
- Deploy smart contract trước
- Copy contract address vào `.env`

## 📚 Tài liệu tham khảo

- [ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Ganache Documentation](https://trufflesuite.com/ganache/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🔄 Migration từ ethers v5 sang v6

| ethers v5 | ethers v6 |
|-----------|-----------|
| `ethers.providers.JsonRpcProvider` | `ethers.JsonRpcProvider` |
| `provider.getSigner()` | `new ethers.Wallet(key, provider)` |
| `contract.functions.method()` | `contract.method()` |
| `BigNumber` | `BigInt` (native JS) |

---

**🎉 Blockchain service đã sẵn sàng!** Deploy smart contract và bắt đầu register products lên blockchain!
