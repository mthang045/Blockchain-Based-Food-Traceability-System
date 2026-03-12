# 🔧 Development & Testing - BlockchainService

## 📝 Checklist trước khi bắt đầu

- [ ] Ganache đã cài đặt và chạy
- [ ] Smart Contract đã deploy
- [ ] File `.env` đã cấu hình đầy đủ
- [ ] ethers.js đã cài đặt (`npm install ethers@6`)

## 🚀 Bước 1: Khởi động Ganache

### Cách 1: Ganache GUI
1. Tải Ganache từ: https://trufflesuite.com/ganache/
2. Mở Ganache → New Workspace (Quickstart)
3. Ganache sẽ chạy trên: `http://127.0.0.1:7545` (hoặc 8545)

### Cách 2: Ganache CLI
```bash
npm install -g ganache

# Khởi động với cấu hình
ganache --port 8545 --networkId 5777 --gasLimit 8000000
```

Output:
```
Available Accounts
==================
(0) 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (100 ETH)
(1) 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (100 ETH)
...

Private Keys
==================
(0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
(1) 0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1
...

Listening on 127.0.0.1:8545
```

## 🔑 Bước 2: Lấy Private Key

Copy Private Key của Account (0) và paste vào `.env`:

```env
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
```

⚠️ **Lưu ý:** Đây là private key cho development. **KHÔNG BAO GIỜ** dùng trên mainnet!

## 📜 Bước 3: Deploy Smart Contract

### Option A: Sử dụng Solidity Contract có sẵn

Tạo file `contracts/FoodTraceability.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodTraceability {
    
    struct Product {
        string name;
        string origin;
        string ipfsHash;
        address manufacturer;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Product) private products;
    
    event ProductRegistered(
        address indexed manufacturer,
        string name,
        string origin,
        string ipfsHash,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        string indexed productId,
        string status,
        address updatedBy,
        uint256 timestamp
    );
    
    function registerProduct(
        string memory name,
        string memory origin,
        string memory ipfsHash
    ) public returns (bool) {
        string memory productId = ipfsHash; // Use ipfsHash as productId
        
        require(!products[productId].exists, "Product already exists");
        
        products[productId] = Product({
            name: name,
            origin: origin,
            ipfsHash: ipfsHash,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        emit ProductRegistered(
            msg.sender,
            name,
            origin,
            ipfsHash,
            block.timestamp
        );
        
        return true;
    }
    
    function getProduct(string memory productId) public view returns (
        string memory name,
        string memory origin,
        string memory ipfsHash,
        address manufacturer,
        uint256 timestamp
    ) {
        require(products[productId].exists, "Product does not exist");
        
        Product memory p = products[productId];
        return (p.name, p.origin, p.ipfsHash, p.manufacturer, p.timestamp);
    }
    
    function verifyProduct(string memory productId) public view returns (bool) {
        return products[productId].exists;
    }
}
```

### Deploy với Remix IDE (Đơn giản nhất)

1. Truy cập: https://remix.ethereum.org/
2. Tạo file mới: `FoodTraceability.sol`
3. Paste code contract vào
4. Compile: Click tab "Solidity Compiler" → Compile
5. Deploy:
   - Click tab "Deploy & Run Transactions"
   - Environment: **Ganache Provider** (hoặc **Injected Provider - MetaMask**)
   - Nhập RPC URL: `http://127.0.0.1:8545`
   - Click **Deploy**
6. Copy **Contract Address** → paste vào `.env`:
   ```env
   CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

### Deploy với Hardhat (Nâng cao)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

npx hardhat init
# Chọn: Create a JavaScript project
```

File `hardhat.config.js`:
```javascript
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.20',
  networks: {
    ganache: {
      url: 'http://127.0.0.1:8545',
      accounts: ['0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d']
    }
  }
};
```

File `scripts/deploy.js`:
```javascript
async function main() {
  const FoodTraceability = await ethers.getContractFactory('FoodTraceability');
  const contract = await FoodTraceability.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log('Contract deployed to:', address);
}

main();
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network ganache
```

## ✅ Bước 4: Cấu hình .env hoàn chỉnh

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/food-traceability

# Blockchain - Ganache
BLOCKCHAIN_NETWORK=ganache
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# JWT
JWT_SECRET=my_super_secret_key_for_development_only
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Bước 5: Test BlockchainService

Tạo file `test-blockchain.js` trong thư mục `backend/`:

```javascript
const blockchainService = require('./services/blockchainService');
require('dotenv').config();

async function testBlockchainService() {
  try {
    console.log('🧪 Testing Blockchain Service...\n');

    // Load ABI
    const contractABI = require('./contracts/FoodTraceability.json').abi;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    // Step 1: Initialize
    console.log('1️⃣ Initializing service...');
    const initResult = await blockchainService.initialize(contractABI, contractAddress);
    console.log('✅ Success:', initResult);
    console.log('');

    // Step 2: Get network info
    console.log('2️⃣ Getting network info...');
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('✅ Network:', networkInfo);
    console.log('');

    // Step 3: Get balance
    console.log('3️⃣ Getting wallet balance...');
    const balance = await blockchainService.getBalance();
    console.log('✅ Balance:', balance);
    console.log('');

    // Step 4: Register product
    console.log('4️⃣ Registering product on blockchain...');
    const productData = {
      name: 'Rau xanh hữu cơ - Test',
      origin: 'Đà Lạt, Việt Nam',
      ipfsHash: `PROD-TEST-${Date.now()}`
    };
    
    const txResult = await blockchainService.registerProduct(
      productData.name,
      productData.origin,
      productData.ipfsHash
    );
    console.log('✅ Transaction Result:', txResult);
    console.log('');

    // Step 5: Get transaction details
    console.log('5️⃣ Getting transaction details...');
    const tx = await blockchainService.getTransaction(txResult.transactionHash);
    console.log('✅ Transaction:', {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasLimit: tx.gasLimit.toString()
    });
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testBlockchainService();
```

Chạy test:
```bash
node test-blockchain.js
```

Output mong đợi:
```
🧪 Testing Blockchain Service...

1️⃣ Initializing service...
🔗 Connecting to blockchain at: http://127.0.0.1:8545
✅ Connected to network: unknown (Chain ID: 1337)
🔑 Wallet address: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
💰 Wallet balance: 100.0 ETH
📜 Contract initialized at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Success: { ... }

2️⃣ Getting network info...
✅ Network: { chainId: '1337', name: 'unknown', blockNumber: 5, rpcUrl: '...' }

3️⃣ Getting wallet balance...
✅ Balance: { address: '0x90F8...', balance: '100.0', balanceWei: '...' }

4️⃣ Registering product on blockchain...
📦 Registering product on blockchain...
   Name: Rau xanh hữu cơ - Test
   Origin: Đà Lạt, Việt Nam
   IPFS Hash: PROD-TEST-1730000000000
⛽ Gas estimate: 150000
📤 Transaction sent: 0xabcd1234...
⏳ Waiting for confirmation...
✅ Transaction confirmed in block: 6
✅ Transaction Result: { success: true, transactionHash: '0xabcd...', ... }

5️⃣ Getting transaction details...
✅ Transaction: { hash: '0xabcd...', from: '0x90F8...', ... }

🎉 All tests passed!
```

## 🔍 Debug & Troubleshooting

### Kiểm tra Ganache đang chạy:
```bash
curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Kiểm tra contract đã deploy:
```bash
curl http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xYOUR_CONTRACT_ADDRESS", "latest"],"id":1}'
```

Nếu trả về `"0x"` → Contract chưa deploy!

### Reset Ganache:
1. Đóng Ganache
2. Xóa workspace data
3. Mở lại và deploy contract mới

## 📚 Resources

- [ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [Ganache Docs](https://trufflesuite.com/docs/ganache/)
- [Remix IDE](https://remix.ethereum.org/)
- [Hardhat Docs](https://hardhat.org/docs)

---

✅ **Setup hoàn tất!** Giờ bạn có thể sử dụng blockchainService trong ứng dụng!
