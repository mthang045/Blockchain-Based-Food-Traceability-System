# 🚀 Hướng dẫn chạy dự án Full Stack

## 📋 Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** (v16 trở lên): https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community
- **Git**: https://git-scm.com/
- **Ganache** (hoặc Hardhat): https://trufflesuite.com/ganache/

## 🔧 Setup Project

### 1. Clone Repository (nếu chưa có)
```bash
git clone https://github.com/mthang045/BlockChain_Nhom13.git
cd BlockChain_Nhom13
```

### 2. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
copy .env.example .env

# Windows: copy .env.example .env
# Linux/Mac: cp .env.example .env
```

**Chỉnh sửa file `.env`:**
```env
PORT=3000
NODE_ENV=development

# MongoDB (local hoặc cloud)
MONGODB_URI=mongodb://localhost:27017/food-traceability

# Blockchain
BLOCKCHAIN_NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_from_ganache
CONTRACT_ADDRESS=your_deployed_contract_address

# JWT Secret (tạo random string)
JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies (bao gồm axios)
npm install

# Tạo file .env
copy .env.example .env
```

**Nội dung file `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Chạy Project

### Cách 1: Chạy từng service (Khuyến nghị cho development)

**Terminal 1 - MongoDB:**
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# hoặc
brew services start mongodb-community
```

**Terminal 2 - Ganache (Blockchain):**
```bash
ganache-cli

# Hoặc mở Ganache Desktop app
```

**Terminal 3 - Backend:**
```bash
cd backend
npm run dev
```

Output:
```
🚀 Server is running on port 3000
📍 Health check: http://localhost:3000/health
🌐 API endpoint: http://localhost:3000/api
✅ MongoDB connected successfully
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
```

Output:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Cách 2: Chạy tất cả với một lệnh (sử dụng tmux hoặc pm2)

**Sử dụng PM2:**
```bash
# Cài đặt PM2
npm install -g pm2

# Chạy backend
cd backend
pm2 start npm --name "backend" -- run dev

# Chạy frontend
cd ../frontend
pm2 start npm --name "frontend" -- run dev

# Xem logs
pm2 logs

# Stop tất cả
pm2 stop all
```

## ✅ Kiểm tra

### 1. Kiểm tra Backend
Mở browser hoặc Postman:
```
http://localhost:3000/health
```

Kết quả mong đợi:
```json
{
  "status": "OK",
  "message": "Food Traceability System Backend is running",
  "timestamp": "2026-03-11T..."
}
```

### 2. Kiểm tra Frontend
Mở browser:
```
http://localhost:5173
```

Bạn sẽ thấy trang Login/Register

### 3. Kiểm tra MongoDB
```bash
# Windows PowerShell
mongosh

# Trong mongo shell
show dbs
use food-traceability
show collections
```

### 4. Kiểm tra Blockchain
Mở browser:
```
http://localhost:8545
```

Hoặc kiểm tra trong frontend, gọi API:
```javascript
fetch('http://localhost:3000/api/blockchain/network')
  .then(r => r.json())
  .then(console.log);
```

## 🎯 Test Flow

### 1. Đăng ký User
```
Frontend: http://localhost:5173
Click "Đăng ký"
- Username: testuser
- Email: test@example.com
- Password: 123456
- Role: MANUFACTURER
```

### 2. Tạo sản phẩm
```
Sau khi đăng nhập → "Tạo sản phẩm"
- Tên: Rau xanh hữu cơ
- Nơi sản xuất: Đà Lạt
- Ngày sản xuất: hôm nay
- Ngày hết hạn: +7 ngày
```

### 3. Xem Dashboard
```
Menu → Dashboard
→ Xem thống kê
→ Xem blockchain info
→ Xem sản phẩm gần đây
```

## 🐛 Troubleshooting

### Backend không start

**Lỗi: "MongoDB connection error"**
```bash
# Kiểm tra MongoDB đang chạy
mongosh
# hoặc
netstat -an | findstr 27017
```

**Lỗi: "Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Frontend không gọi được API

**Lỗi: "Network Error" hoặc CORS**
- Kiểm tra backend đang chạy
- Kiểm tra `VITE_API_URL` trong `.env`
- Kiểm tra `CORS_ORIGIN` trong backend `.env`

**Fix:**
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Blockchain không kết nối

**Lỗi: "Contract address not configured"**
- Deploy smart contract
- Copy contract address
- Update `CONTRACT_ADDRESS` trong backend `.env`

**Lỗi: "Invalid private key"**
- Mở Ganache
- Copy một private key từ accounts
- Paste vào `PRIVATE_KEY` trong `.env`

### MongoDB data bị xóa

```bash
# Seed initial data
cd backend
node scripts/seed.js  # (nếu có script)
```

## 📝 Scripts hữu ích

### Backend
```bash
npm run dev      # Development mode với nodemon
npm start        # Production mode
npm test         # Run tests
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔄 Reset Everything

Nếu gặp quá nhiều lỗi, reset toàn bộ:

```bash
# 1. Stop tất cả services
pm2 stop all
# hoặc Ctrl+C tất cả terminals

# 2. Xóa node_modules và reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend  
rm -rf node_modules package-lock.json
npm install

# 3. Reset MongoDB
mongosh
use food-traceability
db.dropDatabase()

# 4. Restart blockchain
# Đóng Ganache, mở lại để reset accounts

# 5. Chạy lại từ đầu
```

## 📚 Tài liệu API

Xem [APIINTEGRATION.md](APIINTEGRATION.md) để biết chi tiết về:
- Các endpoints có sẵn
- Request/Response format
- Authentication flow
- Code examples

## 🎓 Demo Accounts

Sau khi đăng ký, test với các roles khác nhau:
- ADMIN: Quản trị hệ thống
- MANUFACTURER: Tạo sản phẩm
- TRANSPORTER: Vận chuyển
- STORE: Cửa hàng
- CONSUMER: Người tiêu dùng

## 🚀 Deploy Production

Xem hướng dẫn deploy:
- Backend: Heroku, Railway, DigitalOcean
- Frontend: Vercel, Netlify, GitHub Pages
- MongoDB: MongoDB Atlas
- Blockchain: Testnet (Sepolia, Mumbai)

---

**🎉 Chúc bạn code vui vẻ!** 

Nếu gặp vấn đề, tạo issue trên GitHub hoặc liên hệ team.
