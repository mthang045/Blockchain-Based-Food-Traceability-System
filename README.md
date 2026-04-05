# FoodChain - Blockchain Food Traceability

Hệ thống truy xuất nguồn gốc thực phẩm dùng React, Node.js, MongoDB và Ganache/Ethereum local chain. Ứng dụng hỗ trợ phân quyền theo vai trò, quản lý sản phẩm, theo dõi vận chuyển, quét QR, blockchain logs và dashboard riêng cho từng role.

## Tính năng chính

- Đăng ký/đăng nhập JWT với walletAddress cho tài khoản
- Tự gán walletAddress cho user dev từ pool ví Ganache
- Dashboard riêng cho ADMIN, MANUFACTURER, TRANSPORTER, STORE, CONSUMER
- Tạo lô sản phẩm, cập nhật vận chuyển, nhận hàng tại cửa hàng
- Lịch sử hành trình sản phẩm và blockchain logs
- Quét QR, tra cứu nguồn gốc, xem chi tiết trạng thái sản phẩm
- Code-split route và dashboard theo role để giảm bundle

## Cấu trúc chính

- [backend/](backend) - Express API, MongoDB models, blockchain service
- [frontend/](frontend) - React + Vite app
- [docker-compose.yml](docker-compose.yml) - Tùy chọn chạy bằng container

## Chạy local, không dùng Docker

### Yêu cầu

- Node.js 18+
- MongoDB đang chạy local
- Ganache đang chạy local trên cổng `7545`

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Root scripts tiện dụng

Từ thư mục gốc dự án:

```bash
npm run dev:backend
npm run dev:frontend
```

## Biến môi trường quan trọng

### backend/.env

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/food-traceability
RPC_URL=http://127.0.0.1:7545
MNEMONIC=your_ganache_mnemonic_here
CONTRACT_ADDRESS=your_contract_address_here
JWT_SECRET=your_jwt_secret_key_here
DEV_WALLET_POOL_SIZE=20
```

Bạn cũng có thể set `DEV_WALLET_POOL` để chỉ định sẵn danh sách ví dev.

### frontend/.env

```env
VITE_API_URL=http://localhost:3000/api
```

## Script hữu ích

### Backend

```bash
npm run migrate:dev-wallets
```

Script này quét user cũ chưa có walletAddress và gán ví từ pool dev.

## Tài liệu luồng chạy nhanh

- `RUNPROJECT.md` - Hướng dẫn chạy dự án đầy đủ
- `backend/README.md` - Tài liệu backend chi tiết
- `frontend/README.md` - Tài liệu frontend chi tiết

## Ghi chú

- Môi trường dev hiện không bắt buộc MetaMask cho mọi thao tác.
- Transaction ký bằng private key ví Ganache được gán theo từng user.
- Khi đổi account, cache private key ký giao dịch được tách theo từng ví để tránh lỗi mismatch.
npm run dev

# Truy cập:
# - Frontend: http://localhost:5175
# - Backend API: http://localhost:3000
```

### 📝 Development Setup (Chi tiết)

### Các Bước Cài Đặt

#### 1. Clone Repository
```bash
git clone https://github.com/mthang045/Blockchain-Based-Food-Traceability-System.git
cd Blockchain-Based-Food-Traceability-System
```

#### 2. Cài Đặt và Chạy Backend (Node.js + Express)

**2.1. Cấu hình MongoDB**
```bash
# Option 1: MongoDB Local
# Cài đặt MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Khởi động MongoDB service
# Windows: MongoDB sẽ tự chạy sau khi cài đặt
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Option 2: MongoDB Atlas (Cloud)
# Tạo free cluster tại: https://www.mongodb.com/atlas
# Lấy connection string
```

**2.2. Cấu hình Environment Variables**
```bash
cd backend
cp .env.example .env  # Hoặc tạo file .env mới

# Sửa file .env với thông tin của bạn:
```

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/food_traceability
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_traceability

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Blockchain Configuration (Ganache)
BLOCKCHAIN_NETWORK=http://localhost:7545
CONTRACT_ADDRESS=0xYourContractAddress
PRIVATE_KEY=0xYourPrivateKey

# CORS
FRONTEND_URL=http://localhost:5175
```

**2.3. Cài đặt dependencies và chạy Backend**
```bash
cd backend

# Cài đặt packages
npm install

# Chạy development mode (với nodemon)
npm run dev

# Hoặc chạy production mode
npm start

# Backend sẽ chạy tại: http://localhost:3000
```

**2.4. Test API Endpoints**
```bash
# Health check
curl http://localhost:3000/api/health

# Login (example)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

#### 3. Cài Đặt và Chạy Frontend (React + Vite)

**3.1. Cài đặt dependencies**
```bash
cd frontend

# Sử dụng npm
npm install

# Hoặc sử dụng pnpm (nhanh hơn)
pnpm install
```

**3.2. Cấu hình API endpoint**
```javascript
// frontend/src/app/services/apiService.js
// API_BASE_URL đã được cấu hình sẵn: http://localhost:3000/api
```

**3.3. Chạy development server**
```bash
npm run dev

# Frontend sẽ chạy tại: http://localhost:5175
```

**3.4. Build cho production**
```bash
npm run build

# Output sẽ ở thư mục: dist/
# Deploy dist/ folder lên hosting (Vercel, Netlify, etc.)
```

#### 4. Cài Đặt Blockchain Local (Ganache)

```bash
# Cài đặt Ganache CLI
npm install -g ganache-cli

# Hoặc tải Ganache GUI từ:
# https://trufflesuite.com/ganache/

# Chạy Ganache
ganache-cli -p 7545

# Ganache sẽ tạo 10 test accounts với 100 ETH mỗi account
```

#### 5. Deploy Smart Contracts

```bash
cd backend/contracts

# Cài đặt Truffle (nếu chưa có)
npm install -g truffle

# Compile contracts
truffle compile

# Deploy lên Ganache local network
truffle migrate --network development

# Lưu Contract Address vào .env file
```

#### 6. Chạy với Docker (Tùy chọn)

```bash
# Build và chạy tất cả services
docker-compose up -d

# Backend: http://localhost:3000
# Frontend: http://localhost:5175
# MongoDB: localhost:27017
# Ganache: localhost:7545
```

## 📖 Hướng Dẫn Sử Dụng

### 1. Đăng Nhập
- Truy cập: http://localhost:5175
- Đăng ký tài khoản mới hoặc đăng nhập
- Chọn vai trò: ADMIN, MANUFACTURER, TRANSPORTER, STORE, CONSUMER

### 2. Nhà Sản Xuất (MANUFACTURER)
- **Tạo sản phẩm mới**: 
  - Điền tên, xuất xứ, mô tả, hạn sử dụng
  - Hệ thống tự động tạo QR code và ghi lên blockchain
- **Quản lý sản phẩm**: 
  - Xem danh sách sản phẩm của mình
  - Download QR code dưới dạng PNG
  - In nhãn QR code với template chuyên nghiệp
- **Xem lịch sử blockchain**: Theo dõi mọi thay đổi với transaction hash

### 3. Người Vận Chuyển (TRANSPORTER)
- **Cập nhật vận chuyển**: Ghi nhận các điểm trung chuyển
- **Quản lý lô hàng**: Theo dõi trạng thái (InTransit)
- **Xác nhận blockchain**: Mỗi cập nhật được ghi lên blockchain

### 4. Cửa Hàng (STORE)
- **Nhận hàng**: Cập nhật trạng thái Delivered
- **Quản lý kho**: Xem inventory
- **Truy xuất nguồn gốc**: Xem toàn bộ lịch sử sản phẩm

### 5. Người Tiêu Dùng (CONSUMER)
- **Quét QR bằng camera**: Mở Camera sau để scan QR code
- **Nhập mã thủ công**: Nhập QR code nếu không có camera
- **Xem thông tin đầy đủ**: 
  - Nguồn gốc sản phẩm
  - Nhà sản xuất
  - Lịch sử vận chuyển
  - Transaction hash blockchain
- **Xác minh**: Kiểm tra tính hợp lệ trên blockchain

### 6. Admin (ADMIN)
- **Quản lý người dùng**: CRUD operations cho tất cả users
- **Quản lý sản phẩm**: 
  - Xem tất cả sản phẩm trong hệ thống
  - Thêm, sửa, xóa bất kỳ sản phẩm nào
  - Download/Print QR codes
- **Dashboard**: Thống kê tổng quan hệ thống
- **Blockchain Logs**: Xem tất cả transactions

## 🔐 Blockchain & Smart Contracts

### Architecture
```
┌─────────────┐      REST API      ┌──────────────┐    Web3.js/Ethers    ┌─────────────┐
│   React     │ ←──────────────→   │   Express    │ ←──────────────────→ │   Ganache   │
│  Frontend   │     HTTP/JSON      │   Backend    │      JSON-RPC        │  Blockchain │
└─────────────┘                    └──────────────┘                       └─────────────┘
       ↓                                   ↓                                     ↓
   LocalStorage                        MongoDB                          Smart Contracts
   (Auth Token)                    (Products, Users)                  (Solidity .sol files)
```

### Smart Contract (Solidity)

**FoodSupplyChain.sol**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodSupplyChain {
    // Struct để lưu thông tin sản phẩm
    struct Product {
        uint256 productId;
        string name;
        string origin;
        address producer;
        uint256 timestamp;
        string status;
        bool exists;
    }
    
    // Mapping productId => Product
    mapping(uint256 => Product) public products;
    
    // Events
    event ProductCreated(uint256 indexed productId, string name, address producer);
    event ProductUpdated(uint256 indexed productId, string status, address updater);
    
    // Đăng ký sản phẩm mới
    function registerProduct(
        uint256 _productId,
        string memory _name,
        string memory _origin
    ) public {
        require(!products[_productId].exists, "Product already exists");
        
        products[_productId] = Product({
            productId: _productId,
            name: _name,
            origin: _origin,
            producer: msg.sender,
            timestamp: block.timestamp,
            status: "Produced",
            exists: true
        });
        
        emit ProductCreated(_productId, _name, msg.sender);
    }
    
    // Cập nhật trạng thái sản phẩm
    function updateProductStatus(
        uint256 _productId,
        string memory _status
    ) public {
        require(products[_productId].exists, "Product does not exist");
        
        products[_productId].status = _status;
        emit ProductUpdated(_productId, _status, msg.sender);
    }
    
    // Lấy thông tin sản phẩm
    function getProduct(uint256 _productId) 
        public 
        view 
        returns (Product memory) 
    {
        require(products[_productId].exists, "Product does not exist");
        return products[_productId];
    }
}
```

### Backend Blockchain Service (Node.js)

```javascript
// backend/services/blockchain.service.js
const Web3 = require('web3');
const contractABI = require('../contracts/build/FoodSupplyChain.json');

class BlockchainService {
    constructor() {
        this.web3 = new Web3(process.env.BLOCKCHAIN_NETWORK);
        this.contract = new this.web3.eth.Contract(
            contractABI.abi,
            process.env.CONTRACT_ADDRESS
        );
    }
    
        ## 💡 Tài khoản demo

        Để tiện thử nghiệm nhanh, các thông tin tài khoản demo được liệt kê dưới đây. Bạn có thể sử dụng email dưới đây và bất kỳ mật khẩu nào để đăng nhập (hoặc đăng ký lại nếu cần):

        - Admin: admin@foodchain.vn
        - Nhà sản xuất: producer@foodchain.vn
        - Vận chuyển: transporter@foodchain.vn
        - Cửa hàng: store@foodchain.vn
        - Người tiêu dùng: consumer@foodchain.vn

        Lưu ý: thông tin demo đã được chuyển từ giao diện đăng nhập vào README này.

    // Ghi sản phẩm lên blockchain
    async registerProduct(productData) {
        const accounts = await this.web3.eth.getAccounts();
        const receipt = await this.contract.methods
            .registerProduct(
                productData.productId,
                productData.name,
                productData.origin
            )
            .send({ from: accounts[0], gas: 300000 });
        
        return receipt.transactionHash;
    }
    
    // Cập nhật trạng thái
    async updateProductStatus(productId, status) {
        const accounts = await this.web3.eth.getAccounts();
        const receipt = await this.contract.methods
            .updateProductStatus(productId, status)
            .send({ from: accounts[0], gas: 200000 });
        
        return receipt.transactionHash;
    }
    
    // Đọc thông tin từ blockchain
    async getProduct(productId) {
        return await this.contract.methods
            .getProduct(productId)
            .call();
    }
    
    // Xác minh transaction
    async verifyTransaction(txHash) {
        const receipt = await this.web3.eth.getTransactionReceipt(txHash);
        return receipt && receipt.status;
    }
}

module.exports = new BlockchainService();
```

### Transaction Structure
Mỗi giao dịch trên blockchain bao gồm:
- **Transaction Hash**: Mã băm duy nhất (0x...)
- **Block Number**: Số block chứa transaction
- **From Address**: Địa chỉ ví người gửi
- **To Address**: Địa chỉ smart contract
- **Gas Used**: Phí transaction (wei)
- **Timestamp**: Thời gian block được mine
- **Status**: Success (1) hoặc Fail (0)
- **Events**: ProductCreated, ProductUpdated logs

### Data Flow
1. **Frontend** → User tạo sản phẩm → POST /api/products
2. **Backend** → Validate dữ liệu → Lưu vào MongoDB
3. **Backend** → Gọi blockchain.service.registerProduct()
4. **Smart Contract** → Xử lý transaction → Emit event
5. **Backend** → Nhận transaction hash → Update product.blockchainTxHash
6. **Frontend** → Hiển thị sản phẩm + QR code + blockchain hash

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Tổng quan hệ thống với thống kê và biểu đồ*

### QR Scanner
![QR Scanner](./screenshots/qr-scanner.png)
*Quét QR code bằng camera để xem thông tin sản phẩm*

### Product Management
![Product Management](./screenshots/products.png)
*Quản lý sản phẩm với CRUD operations*

### QR Code Download & Print
![QR Download](./screenshots/qr-download.png)
*Tải xuống và in QR code với template chuyên nghiệp*

## 👥 Nhóm Phát Triển

**Nhóm 13 - Blockchain Food Traceability System**
- Bùi Minh Thắng

## 📝 Roadmap

### Phase 1 - Completed ✅
- [x] Thiết kế UI/UX với Figma
- [x] Xây dựng React frontend với Vite
- [x] Node.js Express backend API
- [x] MongoDB database integration
- [x] JWT authentication & authorization
- [x] Role-based access control (5 roles)
- [x] QR code generation (react-qr-code)

### Phase 2 - Completed ✅
- [x] Smart contract development (Solidity)
- [x] Ganache local blockchain setup
- [x] Web3.js integration
- [x] Product CRUD operations
- [x] User management (Admin)
- [x] Blockchain transaction recording
- [x] QR code scanner với camera (html5-qrcode)
- [x] QR code download (PNG format)
- [x] QR code print với template
- [x] Product description/notes field

### Phase 3 - In Progress 🚧
- [ ] Deploy smart contracts to Ethereum testnet (Sepolia/Goerli)
- [ ] IPFS integration for product images
- [ ] Enhanced blockchain verification
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Export reports (PDF/Excel)

### Phase 4 - Future 📅
- [ ] Mobile app (React Native)
- [ ] AI-powered fraud detection
- [ ] IoT sensor integration
- [ ] Multi-language support (EN, VI, CN)
- [ ] Supply chain optimization AI
- [ ] NFT certificates for products
- [ ] Integration with external APIs (weather, logistics)
- [ ] Smart contracts deployment to testnet
- [ ] Web3j integration
- [ ] IPFS integration for images

### Phase 3 - Future 📅
- [ ] Mobile app (React Native)
- [ ] AI-powered fraud detection
- [ ] IoT integration
- [ ] Multi-language support

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.  
Licensed under the MIT License.

## 📞 Liên Hệ

- **GitHub Repository**: [https://github.com/mthang045/Blockchain-Based-Food-Traceability-System](https://github.com/mthang045/Blockchain-Based-Food-Traceability-System)
- **Issues**: [Report bugs or request features](https://github.com/mthang045/Blockchain-Based-Food-Traceability-System/issues)
- **Email**: Contact through GitHub

## 🎓 Trường Đại Học

Học Viện Hàng Không Việt Nam - Khoa Công nghệ Thông tin  
Môn: Công Nghệ Chuỗi Khối  
Năm học: 2025-2026

---

**⭐ Nếu dự án hữu ích, đừng quên để lại một star trên GitHub!**

## 📚 Tài Liệu Tham Khảo

- [Ethereum Documentation](https://ethereum.org/en/developers/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)

## 🔒 Security

Báo cáo các vấn đề bảo mật qua GitHub Issues hoặc email riêng tư.  
**Không** public security vulnerabilities trên GitHub Issues.

## ⚡ Performance

- Frontend: Tối ưu với Vite build tool và code splitting
- Backend: Node.js với clustering support
- Database: MongoDB indexing cho queries nhanh
- Blockchain: Gas optimization trong smart contracts

## 🌟 Features Highlights

- ✅ **Real-time QR Scanning**: Camera support với html5-qrcode
- ✅ **Professional QR Labels**: Download PNG & Print với template
- ✅ **Blockchain Verification**: Mỗi transaction có unique hash
- ✅ **Role-Based Security**: 5 roles với permissions riêng biệt
- ✅ **Responsive Design**: Mobile-first với Tailwind CSS
- ✅ **Modern UI**: shadcn/ui components với Radix UI
