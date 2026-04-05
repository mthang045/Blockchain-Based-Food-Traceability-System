# Backend

Backend API cho hệ thống FoodChain, xây dựng bằng Node.js, Express, MongoDB và tích hợp blockchain Ethereum local qua Ganache.

## Công nghệ
- Node.js 18+
- Express.js
- MongoDB + Mongoose
- JWT authentication
- ethers.js
- bcryptjs
- nodemon cho development

## Chức năng chính
- Đăng ký, đăng nhập, refresh token
- Quản lý profile người dùng
- Tạo lô sản phẩm / cập nhật trạng thái / lịch sử hành trình
- Quản lý người dùng cho ADMIN
- Ghi và đọc dữ liệu blockchain
- Hỗ trợ related parties cho manufacturer, transporter, store, consumer
- Tự gán walletAddress cho user dev từ pool ví Ganache
- Script migrate user cũ sang wallet pool

## Cấu trúc chính
```text
backend/
├── config/                 # Database, blockchain config
├── controllers/            # Route handlers
├── middleware/             # Auth, signature, tx signing
├── models/                 # Mongoose models
├── routes/                 # Express routes
├── services/               # Business logic
├── scripts/                # Utility scripts / migrations
├── utils/                  # Helpers
├── server.js               # App entry point
└── package.json            # Scripts and dependencies
```

## Cài đặt
```bash
cd backend
npm install
```

## Biến môi trường
Tạo file `.env` trong thư mục backend:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/food-traceability
RPC_URL=http://127.0.0.1:7545
MNEMONIC=your_ganache_mnemonic_here
CONTRACT_ADDRESS=your_contract_address_here
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
DEV_WALLET_POOL_SIZE=20
# Hoặc set DEV_WALLET_POOL=0xabc...,0xdef...
```

## Chạy development
```bash
npm run dev
```

## Script hữu ích
```bash
npm run seed
npm run seed:users
npm run seed:clean
npm run migrate:dev-wallets
npm run truffle:compile
npm run truffle:migrate
npm run truffle:test
```

## API chính
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `GET /api/products`
- `POST /api/products`
- `POST /api/products/batches`
- `PUT /api/products/:productId/status`
- `GET /api/products/:productId/history`
- `GET /api/blockchain/logs`

## Ghi chú triển khai
- Môi trường dev hiện có thể chạy không cần MetaMask.
- Request ký giao dịch được kiểm tra theo walletAddress của user.
- Các tài khoản có vai trò giao dịch nên có walletAddress hợp lệ.

## Troubleshooting
### MongoDB không kết nối
- Kiểm tra MongoDB local đang chạy trên cổng 27017.

### Blockchain không kết nối
- Kiểm tra Ganache đang chạy trên `http://127.0.0.1:7545`.
- Kiểm tra `CONTRACT_ADDRESS` trong `.env` khớp contract đã deploy.

### Tạo lô / cập nhật trạng thái lỗi ký
- Đảm bảo private key bạn nhập khớp với walletAddress của user hiện tại.
- Logout rồi login lại nếu bạn vừa đổi tài khoản dev.
