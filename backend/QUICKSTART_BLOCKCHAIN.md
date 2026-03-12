# 🚀 Quick Start - BlockchainService với Ganache

## ⚡ Tóm tắt nhanh (5 phút)

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Khởi động Ganache

**Download và cài đặt Ganache:** https://trufflesuite.com/ganache/

- Mở Ganache → **Quickstart** (Ethereum)
- Ganache sẽ chạy trên: `http://127.0.0.1:7545`
- 10 accounts được tạo, mỗi account có **100 ETH**

### 3. Lấy Private Key từ Ganache

1. Click vào **biểu tượng 🔑** bên cạnh Account (0)
2. Copy Private Key (dạng: `0x4f3edf983ac636a65...`)

### 4. Deploy Smart Contract

**Cách nhanh nhất: Sử dụng Remix IDE**

1. Truy cập: https://remix.ethereum.org/
2. Tạo file mới: `FoodTraceability.sol`
3. Copy nội dung từ `backend/contracts/FoodTraceability.sol`
4. **Compile:**
   - Tab "Solidity Compiler"
   - Compiler version: `0.8.x`
   - Click **"Compile FoodTraceability.sol"**
5. **Deploy:**
   - Tab "Deploy & Run Transactions"
   - Environment: **"Ganache Provider"**
   - Ganache URL: `http://127.0.0.1:7545`
   - Click **"Deploy"**
6. Copy **Contract Address** (dạng: `0x5FbDB...`)

### 5. Cấu hình .env

Tạo file `.env` trong thư mục `backend/`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/food-traceability

# Blockchain - Ganache
RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# JWT
JWT_SECRET=my_secret_key_for_dev
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Thay thế:**
- `PRIVATE_KEY` bằng private key từ Ganache
- `CONTRACT_ADDRESS` bằng contract address sau khi deploy

### 6. Test BlockchainService

```bash
npm run test:blockchain
```

**Kết quả mong đợi:**

```
🧪 Testing Blockchain Service...

============================================================
TEST 1: Initialize Blockchain Service
============================================================
🔗 Connecting to blockchain at: http://127.0.0.1:7545
✅ Connected to network: unknown (Chain ID: 1337)
🔑 Wallet address: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
💰 Wallet balance: 100.0 ETH
📜 Contract initialized at: 0x5FbDB...
✅ Initialization Result:
   Success: true
   Wallet: 0x90F8bf...
   Balance: 100.0 ETH
   Contract: 0x5FbDB...

...

============================================================
🎉 ALL TESTS PASSED SUCCESSFULLY!
============================================================
```

### 7. Sử dụng trong code

```javascript
const blockchainService = require('./services/blockchainService');

// Initialize (chỉ 1 lần khi server start)
const contractABI = require('./contracts/FoodTraceability.json').abi;
await blockchainService.initialize(contractABI, process.env.CONTRACT_ADDRESS);

// Register product
const result = await blockchainService.registerProduct(
  'Rau xanh hữu cơ',
  'Đà Lạt, Việt Nam',
  'PROD-001'
);

console.log('Transaction Hash:', result.transactionHash);
console.log('Block Number:', result.blockNumber);
```

## 📋 Checklist

- [ ] Ganache đang chạy ✅
- [ ] Smart contract đã deploy ✅
- [ ] File `.env` đã tạo và cấu hình ✅
- [ ] `npm install` đã chạy ✅
- [ ] Test passed (`npm run test:blockchain`) ✅

## 🔧 Troubleshooting

### ❌ "Network connection error"
→ Kiểm tra Ganache đang chạy, đúng port trong `.env`

### ❌ "Contract address is required"
→ Deploy contract, copy address vào `.env`

### ❌ "Insufficient funds"
→ Sử dụng private key từ Ganache accounts (có sẵn 100 ETH)

### ❌ "Transaction reverted"
→ Kiểm tra contract đã deploy đúng chưa

## 📚 Tài liệu chi tiết

- [README_BLOCKCHAIN_SERVICE.md](services/README_BLOCKCHAIN_SERVICE.md) - Hướng dẫn sử dụng API
- [BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md) - Hướng dẫn setup chi tiết
- [FoodTraceability.sol](contracts/FoodTraceability.sol) - Smart contract source code

## 🎯 Next Steps

1. ✅ Test xong → Tích hợp vào Express routes
2. ✅ Update các controllers để gọi blockchainService
3. ✅ Connect frontend với backend API
4. ✅ Test end-to-end flow

---

**🎉 Hoàn tất!** BlockchainService đã sẵn sàng để tích hợp vào ứng dụng!

**Questions?** Đọc [BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md) để biết thêm chi tiết.
