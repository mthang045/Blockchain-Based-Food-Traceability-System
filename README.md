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
- Đăng nhập/Đăng ký với hệ thống phân quyền
- Quản lý profile người dùng
- Phân quyền theo vai trò (Admin, Producer, Distributor, Consumer)

### 📦 Quản Lý Sản Phẩm
- **Tạo sản phẩm mới**: Nhập thông tin chi tiết về sản phẩm
- **Quản lý sản phẩm**: Xem, sửa, xóa sản phẩm của mình
- **Kho sản phẩm**: Quản lý tồn kho và trạng thái sản phẩm
- **Quản lý người dùng**: (Admin) Quản lý tài khoản trong hệ thống

### 🚚 Chuỗi Cung Ứng
- **Theo dõi vận chuyển**: Cập nhật trạng thái vận chuyển theo thời gian thực
- **Lịch sử blockchain**: Xem toàn bộ giao dịch trên blockchain
- **Quản lý quy trình**: Theo dõi từng bước trong chuỗi cung ứng

### 📱 Truy Xuất Nguồn Gốc
- **Quét mã QR**: Quét QR code để xem thông tin sản phẩm
- **Xác minh blockchain**: Kiểm tra tính hợp lệ của dữ liệu trên blockchain
- **Lịch sử sản phẩm**: Xem toàn bộ hành trình của sản phẩm

### 📊 Dashboard & Báo Cáo
- Tổng quan thống kê hệ thống
- Biểu đồ phân tích dữ liệu
- Báo cáo hoạt động

## 🛠️ Công Nghệ Sử Dụng

### Backend (Java)
- **Java 17+** - Ngôn ngữ lập trình chính
- **Spring Boot 3.x** - Framework backend
- **Spring Security** - Xác thực và phân quyền
- **Spring Data JPA** - ORM và database access
- **Hibernate** - JPA implementation
- **MySQL/PostgreSQL** - Cơ sở dữ liệu quan hệ
- **Web3j** - Java library cho Ethereum blockchain
- **Maven/Gradle** - Build tool và dependency management
- **JWT (JSON Web Tokens)** - Authentication
- **Lombok** - Giảm boilerplate code

### Frontend (React)
- **React 18.3.1** - Thư viện UI hiện đại
- **JavaScript (ES6+)** - Ngôn ngữ lập trình
- **Vite 6.3.5** - Build tool nhanh và tối ưu
- **React Router 7.13.0** - Routing
- **Tailwind CSS 4.1.12** - Styling framework

### UI Components
- **Material-UI (MUI) 7.3.5** - Component library chính
- **Radix UI** - Accessible component primitives
- **Recharts 2.15.2** - Biểu đồ và visualization
- **Lucide React** - Icons
- **React QR Code** - Tạo và đọc mã QR
- **Sonner** - Toast notifications

### Form & Validation
- **React Hook Form 7.55.0** - Quản lý form
- **Date-fns 3.6.0** - Xử lý ngày tháng

### Blockchain
- **Ethereum/Hyperledger Fabric** - Blockchain platform
- **Solidity** - Smart contract language (Ethereum)
- **Truffle/Hardhat** - Smart contract development
- **IPFS** - Decentralized file storage
- **Web3j** - Java library tương tác với blockchain

### DevOps & Tools
- **Docker** - Containerization
- **Git** - Version control
- **Postman** - API testing
- **Swagger/OpenAPI** - API documentation

## 📁 Cấu Trúc Dự Án

```
Blockchain_Nhom13/
├── backend/                   # Java Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/blockchain/food/
│   │   │   │       ├── FoodTraceabilityApplication.java
│   │   │   │       ├── config/          # Configuration classes
│   │   │   │       │   ├── SecurityConfig.java
│   │   │   │       │   ├── Web3Config.java
│   │   │   │       │   └── SwaggerConfig.java
│   │   │   │       ├── controller/      # REST API Controllers
│   │   │   │       │   ├── AuthController.java
│   │   │   │       │   ├── ProductController.java
│   │   │   │       │   ├── SupplyChainController.java
│   │   │   │       │   └── BlockchainController.java
│   │   │   │       ├── model/           # Entity models
│   │   │   │       │   ├── User.java
│   │   │   │       │   ├── Product.java
│   │   │   │       │   ├── SupplyChainStep.java
│   │   │   │       │   └── BlockchainTransaction.java
│   │   │   │       ├── repository/      # JPA Repositories
│   │   │   │       │   ├── UserRepository.java
│   │   │   │       │   ├── ProductRepository.java
│   │   │   │       │   └── TransactionRepository.java
│   │   │   │       ├── service/         # Business logic
│   │   │   │       │   ├── AuthService.java
│   │   │   │       │   ├── ProductService.java
│   │   │   │       │   ├── BlockchainService.java
│   │   │   │       │   └── QRCodeService.java
│   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │       │   ├── LoginRequest.java
│   │   │   │       │   ├── ProductDTO.java
│   │   │   │       │   └── ApiResponse.java
│   │   │   │       ├── security/        # Security components
│   │   │   │       │   ├── JwtTokenProvider.java
│   │   │   │       │   └── JwtAuthenticationFilter.java
│   │   │   │       └── exception/       # Exception handlers
│   │   │   │           └── GlobalExceptionHandler.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       └── application-prod.properties
│   │   └── test/               # Unit & Integration tests
│   ├── pom.xml                 # Maven dependencies
│   └── Dockerfile              # Docker configuration
│
├── frontend/                   # React Frontend
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
- **Java**: JDK 17 hoặc cao hơn
- **Node.js**: >= 16.x
- **Database**: MySQL 8.0+ hoặc PostgreSQL 13+
- **Maven**: 3.8+ hoặc Gradle 7+
- **Docker** (tùy chọn): Để chạy với containers
- **Git**: Version control

### ⚡ Quick Start (Khuyến nghị)

Cách nhanh nhất để chạy toàn bộ hệ thống với Docker:

```bash
# Clone repository
git clone <repository-url>
cd Blockchain_Nhom13

# Chạy tất cả services (Backend + Frontend + Database)
docker-compose up -d

# Truy cập:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080/api
# - Swagger Docs: http://localhost:8080/swagger-ui.html
```

### 📝 Development Setup (Chi tiết)

### Các Bước Cài Đặt

#### 1. Clone Repository
```bash
git clone <repository-url>
cd Blockchain_Nhom13
```

#### 2. Cài Đặt và Chạy Backend (Java Spring Boot)

**2.1. Cấu hình Database**
```bash
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE food_traceability;
CREATE USER 'fooduser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON food_traceability.* TO 'fooduser'@'localhost';
FLUSH PRIVILEGES;
```

**2.2. Cấu hình application.properties**
```bash
cd backend/src/main/resources
# Sửa file application.properties với thông tin database của bạn
```

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/food_traceability
spring.datasource.username=fooduser
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Blockchain Configuration
blockchain.network.url=http://localhost:8545
blockchain.contract.address=0x...
```

**2.3. Build và chạy Backend**
```bash
cd backend

# Sử dụng Maven
mvn clean install
mvn spring-boot:run

# Hoặc sử dụng Gradle
gradle build
gradle bootRun

# Backend sẽ chạy tại: http://localhost:8080
```

**2.4. Kiểm tra API Documentation**
```
Truy cập Swagger UI: http://localhost:8080/swagger-ui.html
```

#### 3. Cài Đặt và Chạy Frontend (React)

**3.1. Cài đặt dependencies**
```bash
cd frontend

# Sử dụng npm
npm install

# Hoặc sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc sử dụng yarn
yarn install
```

**3.2. Cấu hình API endpoint**
```javascript
// frontend/src/app/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';
```

**3.3. Chạy development server**
```bash
npm run dev
# hoặc
pnpm dev
# hoặc
yarn dev

# Frontend sẽ chạy tại: http://localhost:5173
```

**3.4. Build cho production**
```bash
npm run build
# hoặc
pnpm build
```

#### 4. Chạy với Docker (Tùy chọn)

```bash
# Build và chạy tất cả services
docker-compose up -d

# Backend: http://localhost:8080
# Frontend: http://localhost:3000
# Database: localhost:3306
```

#### 5. Deploy Smart Contracts (Nếu dùng Ethereum)

```bash
cd smart-contracts
npm install
npx truffle migrate --network development
# hoặc
npx hardhat run scripts/deploy.js --network localhost
```

## 📖 Hướng Dẫn Sử Dụng

### 1. Đăng Nhập
- Truy cập trang đăng nhập
- Nhập thông tin tài khoản
- Chọn vai trò phù hợp (Producer/Distributor/Consumer)

### 2. Người Sản Xuất (Producer)
- **Tạo sản phẩm mới**: Nhập thông tin sản phẩm, hình ảnh, nguồn gốc
- **Quản lý sản phẩm**: Xem danh sách, chỉnh sửa, xóa sản phẩm
- **Xem lịch sử blockchain**: Theo dõi các giao dịch liên quan

### 3. Nhà Phân Phối (Distributor)  
- **Cập nhật vận chuyển**: Ghi nhận các điểm trung chuyển
- **Quản lý lô hàng**: Theo dõi trạng thái vận chuyển
- **Xác nhận blockchain**: Mỗi bước được ghi vào blockchain

### 4. Người Tiêu Dùng (Consumer)
- **Quét mã QR**: Sử dụng camera để quét QR code trên sản phẩm
- **Xem thông tin**: Xem đầy đủ thông tin nguồn gốc và hành trình
- **Xác minh**: Kiểm tra tính hợp lệ của dữ liệu

### 5. Admin
- **Quản lý người dùng**: Thêm, sửa, xóa tài khoản
- **Quản lý sản phẩm**: Giám sát toàn bộ sản phẩm trong hệ thống
- **Xem báo cáo**: Thống kê và phân tích dữ liệu

## 🔐 Blockchain & Smart Contracts

### Architecture
```
┌─────────────┐      REST API      ┌──────────────┐      Web3j      ┌─────────────┐
│   React     │ ←──────────────→   │ Spring Boot  │ ←────────────→  │  Ethereum   │
│  Frontend   │     HTTP/JSON      │   Backend    │   JSON-RPC     │  Blockchain │
└─────────────┘                    └──────────────┘                 └─────────────┘
       ↓                                   ↓                               ↓
   LocalStorage                        MySQL/PostgreSQL            Smart Contracts
```

### Smart Contracts (Solidity)

**ProductRegistry.sol**
```solidity
// Quản lý thông tin sản phẩm
- registerProduct()     // Đăng ký sản phẩm mới
- updateProduct()       // Cập nhật thông tin
- getProduct()          // Lấy thông tin sản phẩm
- verifyProduct()       // Xác minh tính hợp lệ
```

**SupplyChain.sol**
```solidity
// Quản lý chuỗi cung ứng
- addSupplyChainStep()  // Thêm bước vận chuyển
- getProductHistory()   // Lấy lịch sử sản phẩm
- getCurrentOwner()     // Lấy chủ sở hữu hiện tại
- transferOwnership()   // Chuyển quyền sở hữu
```

### Backend Blockchain Service (Java)

```java
@Service
public class BlockchainService {
    // Kết nối với Ethereum node thông qua Web3j
    private Web3j web3j;
    
    // Ghi dữ liệu lên blockchain
    public String writeToBlockchain(ProductData data) {
        // Tạo transaction và gửi lên smart contract
        // Trả về transaction hash
    }
    
    // Đọc dữ liệu từ blockchain
    public ProductData readFromBlockchain(String txHash) {
        // Query smart contract
        // Trả về dữ liệu sản phẩm
    }
    
    // Xác minh dữ liệu
    public boolean verifyData(String hash, ProductData data) {
        // So sánh hash và verify signature
    }
}
```

### Transaction Structure
Mỗi giao dịch trên blockchain bao gồm:
- **Transaction Hash**: Mã băm duy nhất (0x...)
- **Block Number**: Số block chứa transaction
- **Type**: Loại giao dịch (product_created, supply_chain_updated)
- **Product ID**: ID sản phẩm liên quan
- **From/To Address**: Địa chỉ ví người gửi/nhận
- **Data**: Dữ liệu chi tiết (mã hóa)
- **Gas Used**: Phí transaction
- **Timestamp**: Thời gian giao dịch
- **Confirmations**: Số confirmations

### Data Flow
1. **Frontend** → Gửi request tạo sản phẩm
2. **Backend** → Validate và lưu vào MySQL
3. **Backend** → Gọi smart contract qua Web3j
4. **Blockchain** → Xử lý transaction và trả về hash
5. **Backend** → Lưu transaction hash vào database
6. **Frontend** → Hiển thị kết quả và QR code

## 📸 Screenshots

<!-- Thêm screenshots của ứng dụng tại đây -->
```
[Dashboard] - [Product Management] - [QR Scan] - [Blockchain Logs]
```

## 👥 Nhóm Phát Triển

**Nhóm 13**
- Thành viên 1 - [Vai trò]
- Thành viên 2 - [Vai trò]
- Thành viên 3 - [Vai trò]
- Thành viên 4 - [Vai trò]
- Thành viên 5 - [Vai trò]

## 📝 Roadmap

### Phase 1 - Current ✅
- [x] Thiết kế UI/UX
- [x] Xây dựng các trang chính
- [x] Mock blockchain service
- [x] QR code generation/scanning

### Phase 2 - In Progress 🚧
- [x] Java Spring Boot backend API
- [x] MySQL database integration
- [x] JWT authentication
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

## 📞 Liên Hệ

- **Email**: [your-email@example.com]
- **GitHub**: [github-link]
- **Website**: [website-link]

---

**⭐ Nếu dự án hữu ích, đừng quên để lại một star!**
