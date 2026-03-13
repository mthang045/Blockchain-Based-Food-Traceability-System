# 🍃 Hệ Thống Truy Xuất Nguồn Gốc Thực Phẩm Trên Nền Tảng Blockchain

## 📋 Giới Thiệu

Dự án xây dựng hệ thống truy xuất nguồn gốc thực phẩm sử dụng công nghệ Blockchain nhằm đảm bảo tính minh bạch, an toàn và tin cậy trong chuỗi cung ứng thực phẩm. Hệ thống cho phép người tiêu dùng tra cứu thông tin đầy đủ về nguồn gốc, quy trình sản xuất và vận chuyển của sản phẩm thực phẩm thông qua mã QR.

### 🎯 Mục Tiêu

- Tăng cường tính minh bạch trong chuỗi cung ứng thực phẩm
- Đảm bảo tính bất biến của dữ liệu thông qua công nghệ blockchain
- Giúp người tiêu dùng dễ dàng xác minh nguồn gốc thực phẩm
- Hỗ trợ quản lý và theo dõi sản phẩm cho các bên liên quan

## ✨ Tính Năng Chính

### 🔐 Xác Thực & Phân Quyền
- ✅ Đăng nhập/Đăng ký với JWT authentication
- ✅ Quản lý profile người dùng với wallet address
- ✅ Phân quyền theo vai trò: ADMIN, MANUFACTURER, TRANSPORTER, STORE, CONSUMER
- ✅ Bảo mật với bcrypt password hashing

### 📦 Quản Lý Sản Phẩm
- ✅ **Tạo sản phẩm mới**: Nhập thông tin chi tiết (tên, xuất xứ, hạn sử dụng, ghi chú)
- ✅ **Quản lý sản phẩm**: Xem, sửa, xóa sản phẩm (Admin & Manufacturer)
- ✅ **Trạng thái sản phẩm**: Produced, InTransit, Delivered
- ✅ **Quản lý người dùng**: (Admin) CRUD operations cho user accounts
- ✅ **QR Code tự động**: Mỗi sản phẩm có QR code unique

### 🚚 Chuỗi Cung Ứng
- ✅ **Theo dõi vận chuyển**: Cập nhật trạng thái theo thời gian thực
- ✅ **Lịch sử blockchain**: Xem toàn bộ transaction history với blockchain hash
- ✅ **Quản lý quy trình**: Theo dõi từng bước trong supply chain
- ✅ **Smart Contract Integration**: Ghi nhận mọi thay đổi lên Ethereum blockchain

### 📱 Truy Xuất Nguồn Gốc & QR Code
- ✅ **Quét QR bằng camera**: Sử dụng camera sau để quét mã QR (html5-qrcode)
- ✅ **Nhập mã thủ công**: Chế độ nhập QR code bằng bàn phím
- ✅ **Tải xuống QR Code**: Download QR code dưới dạng PNG (400x400px)
- ✅ **In nhãn dán QR**: In QR code với template chuyên nghiệp
- ✅ **Xác minh blockchain**: Kiểm tra transaction hash và block number
- ✅ **Lịch sử đầy đủ**: Timeline chi tiết từ sản xuất đến người tiêu dùng

### 📊 Dashboard & Báo Cáo
- ✅ Tổng quan thống kê: Tổng sản phẩm, người dùng, giao dịch
- ✅ Biểu đồ phân tích: Product status distribution
- ✅ Recent activities và blockchain logs
- ✅ Role-based dashboard views

## 🛠️ Công Nghệ Sử Dụng

### Backend (Node.js)
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication & authorization
- **bcrypt** - Password hashing
- **Web3.js** - Ethereum blockchain interaction
- **ethers.js** - Ethereum library
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables management

### Frontend (React)
- **React 18.3.1** - Thư viện UI hiện đại
- **JavaScript (ES6+)** - Ngôn ngữ lập trình
- **Vite 6.3.5** - Build tool nhanh và tối ưu
- **React Router 7.13.0** - Client-side routing
- **Tailwind CSS 4.1.12** - Utility-first CSS framework

### UI Components & Libraries
- **Material-UI (MUI) 7.3.5** - Component library chính
- **Radix UI** - Accessible component primitives
- **Recharts 2.15.2** - Biểu đồ và data visualization
- **Lucide React** - Beautiful icon library
- **React QR Code 2.0.18** - QR code generator
- **html5-qrcode** - QR code scanner với camera
- **Sonner** - Toast notifications elegant

### Form & Utilities
- **React Hook Form 7.55.0** - Form management
- **Date-fns 3.6.0** - Date manipulation
- **clsx** - Conditional className utility
- **Canvas API** - QR code download (SVG to PNG)

### Blockchain
- **Ethereum** - Blockchain platform
- **Ganache** - Local Ethereum blockchain for development
- **Solidity** - Smart contract programming language
- **Truffle/Hardhat** - Smart contract development framework
- **Web3.js/Ethers.js** - Blockchain interaction libraries

### DevOps & Tools
- **Docker** - Containerization
- **Git** - Version control
- **Postman/Thunder Client** - API testing
- **MongoDB Atlas** - Cloud database (production)

## 📁 Cấu Trúc Dự Án

```
Blockchain_Nhom13/
├── backend/                      # Node.js Express Backend
│   ├── config/                   # Configuration files
│   │   └── database.js          # MongoDB connection config
│   ├── contracts/               # Smart Contracts (Solidity)
│   │   ├── FoodSupplyChain.sol # Main smart contract
│   │   └── build/              # Compiled contracts
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js  # Authentication logic
│   │   ├── product.controller.js # Product CRUD operations
│   │   └── user.controller.js  # User management
│   ├── middleware/              # Express middlewares
│   │   ├── auth.middleware.js  # JWT verification
│   │   └── errorHandler.js     # Error handling
│   ├── models/                  # Mongoose schemas
│   │   ├── User.model.js       # User schema
│   │   ├── Product.model.js    # Product schema
│   │   └── Transaction.model.js # Blockchain transaction
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js      # Auth endpoints
│   │   ├── product.routes.js   # Product endpoints
│   │   └── user.routes.js      # User endpoints
│   ├── services/                # Business logic layer
│   │   ├── blockchain.service.js # Blockchain interaction
│   │   ├── product.service.js  # Product operations
│   │   └── auth.service.js     # Authentication
│   ├── utils/                   # Utility functions
│   │   ├── logger.js           # Logging utility
│   │   └── validators.js       # Input validation
│   ├── .env                     # Environment variables
│   ├── server.js               # Main entry point
│   ├── package.json            # Dependencies
│   └── Dockerfile              # Docker configuration
│
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable components
│   │   │   │   ├── figma/     # Figma design components
│   │   │   │   ├── layout/    # Layout components
│   │   │   │   │   └── DashboardLayout.jsx
│   │   │   │   └── ui/        # UI primitives (shadcn/ui)
│   │   │   │       ├── button.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       └── ... (40+ components)
│   │   │   ├── contexts/      # React Context providers
│   │   │   │   └── AuthContext.jsx # Auth state management
│   │   │   ├── pages/         # Page components
│   │   │   │   ├── BlockchainLogsPage.jsx # Blockchain history
│   │   │   │   ├── CreateProductPage.jsx  # Create product form
│   │   │   │   ├── DashboardPage.jsx      # Main dashboard
│   │   │   │   ├── LoginPage.jsx          # Login/Register
│   │   │   │   ├── MyProductsPage.jsx     # Manufacturer products
│   │   │   │   ├── ProductsManagementPage.jsx # Admin CRUD
│   │   │   │   ├── ProfilePage.jsx        # User profile
│   │   │   │   ├── ScanQRPage.jsx         # QR scanner with camera
│   │   │   │   ├── StoreProductsPage.jsx  # Store inventory
│   │   │   │   ├── TransportPage.jsx      # Transport tracking
│   │   │   │   └── UsersManagementPage.jsx # Admin user CRUD
│   │   │   ├── services/      # API client services
│   │   │   │   ├── apiService.js # Axios instance & API calls
│   │   │   │   ├── blockchain.js # Blockchain queries
│   │   │   │   └── storage.js # LocalStorage utilities
│   │   │   ├── App.jsx        # Root component
│   │   │   ├── routes.jsx     # Route configuration
│   │   │   └── types.js       # Type definitions
│   │   └── styles/            # Global styles
│   │       ├── fonts.css
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── postcss.config.mjs    # PostCSS config
│   └── Dockerfile            # Frontend Docker config
│
├── docker-compose.yml         # Multi-container setup
├── .gitignore                # Git ignore rules
├── QUICKSTART.md             # Quick setup guide
└── README.md                 # Project documentation
```

## 🚀 Cài Đặt
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/         # Các components tái sử dụng
│   │   │   │   ├── figma/         # Components từ Figma
│   │   │   │   ├── layout/        # Layout components
│   │   │   │   └── ui/            # UI components (buttons, cards, etc.)
│   │   │   ├── contexts/          # React contexts
│   │   │   │   └── AuthContext.jsx
│   │   │   ├── pages/             # Các trang chính
│   │   │   │   ├── BlockchainLogsPage.jsx
│   │   │   │   ├── CreateProductPage.jsx
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── MyProductsPage.jsx
│   │   │   │   ├── ProductsManagementPage.jsx
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── ScanQRPage.jsx
│   │   │   │   ├── StoreProductsPage.jsx
│   │   │   │   ├── TransportPage.jsx
│   │   │   │   └── UsersManagementPage.jsx
│   │   │   └── services/          # API services
│   │   │       ├── api.js         # Axios configuration
│   │   │       ├── authService.js # Authentication API
│   │   │       ├── productService.js
│   │   │       └── blockchainService.js
│   │   └── styles/                # Global styles
│   │       ├── fonts.css
│   │       ├── index.css
│   │       ├── tailwind.css
│   │       └── theme.css
│   ├── package.json
│   ├── vite.config.js            # Vite configuration
│   └── postcss.config.mjs        # PostCSS configuration
│
├── smart-contracts/           # Smart Contracts (Solidity)
│   ├── contracts/
│   │   ├── ProductRegistry.sol
│   │   ├── SupplyChain.sol
│   │   └── AccessControl.sol
│   ├── migrations/
│   ├── test/
│   └── truffle-config.js
│
├── docker-compose.yml         # Docker compose configuration
├── .gitignore
└── README.md
```

## 🚀 Cài Đặt và Chạy Dự Án

### Yêu Cầu Hệ Thống
- **Node.js**: >= 18.x (LTS recommended)
- **npm** hoặc **pnpm**: Latest version
- **MongoDB**: 5.0+ (Local hoặc MongoDB Atlas)
- **Ganache**: Ethereum local blockchain (optional)
- **Git**: Version control
- **Docker** (tùy chọn): Để chạy với containers

### ⚡ Quick Start (Khuyến nghị)

Cách nhanh nhất để chạy toàn bộ hệ thống:

```bash
# Clone repository
git clone https://github.com/mthang045/Blockchain-Based-Food-Traceability-System.git
cd Blockchain-Based-Food-Traceability-System

# Chạy Backend
cd backend
npm install
npm start

# Chạy Frontend (terminal mới)
cd frontend
npm install
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
