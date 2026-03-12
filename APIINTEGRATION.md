# Kết nối Frontend với Backend API

## 🔗 Files đã tạo/cập nhật

### 1. **API Services** (Mới tạo)
- [`frontend/src/app/services/api.js`](frontend/src/app/services/api.js) - Axios client với interceptors
- [`frontend/src/app/services/apiService.js`](frontend/src/app/services/apiService.js) - API endpoints (auth, product, blockchain)
- [`frontend/.env.example`](frontend/.env.example) - Environment variables template

### 2. **Context** (Đã cập nhật)
- [`frontend/src/app/contexts/AuthContext.jsx`](frontend/src/app/contexts/AuthContext.jsx) - Sử dụng real API thay vì mock

### 3. **Pages** (Đã cập nhật)
- [`frontend/src/app/pages/LoginPage.jsx`](frontend/src/app/pages/LoginPage.jsx) - Login/Register với API
- [`frontend/src/app/pages/CreateProductPage.jsx`](frontend/src/app/pages/CreateProductPage.jsx) - Tạo sản phẩm qua API
- [`frontend/src/app/pages/MyProductsPage.jsx`](frontend/src/app/pages/MyProductsPage.jsx) - Lấy danh sách sản phẩm từ API
- [`frontend/src/app/pages/DashboardPage_API.jsx`](frontend/src/app/pages/DashboardPage_API.jsx) - Dashboard với real data

## 🚀 Hướng dẫn sử dụng

### Bước 1: Cài đặt dependencies
```bash
cd frontend
npm install axios
```

### Bước 2: Tạo file .env
```bash
cd frontend
copy .env.example .env
```

Nội dung `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Bước 3: Khởi động Backend
```bash
cd backend
npm install
npm run dev
```
Backend sẽ chạy tại `http://localhost:3000`

### Bước 4: Khởi động Frontend
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy tại `http://localhost:5173`

## 📡 API Endpoints đã tích hợp

### Authentication
```javascript
import { authAPI } from './services/apiService';

// Register
await authAPI.register({
  username: 'john',
  email: 'john@example.com',
  password: 'password123',
  role: 'MANUFACTURER'
});

// Login
await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
});

// Get Profile
await authAPI.getProfile();
```

### Products
```javascript
import { productAPI } from './services/apiService';

// Get all products
await productAPI.getAllProducts();

// Get product by ID
await productAPI.getProductById('PROD-123');

// Create product
await productAPI.createProduct({
  productId: 'PROD-123',
  name: 'Rau xanh',
  origin: 'Đà Lạt',
  manufacturer: 'Nông trại ABC',
  // ...
});

// Update status
await productAPI.updateProductStatus('PROD-123', 'IN_TRANSIT');

// Get history
await productAPI.getProductHistory('PROD-123');
```

### Blockchain
```javascript
import { blockchainAPI } from './services/apiService';

// Network info
await blockchainAPI.getNetworkInfo();

// Transaction details
await blockchainAPI.getTransaction('0x123...');

// Verify product
await blockchainAPI.verifyProduct('PROD-123');

// Get logs
await blockchainAPI.getAllLogs();
```

## 🔐 Authentication Flow

1. User nhập email/password
2. Frontend gọi `authAPI.login()`
3. Backend verify và trả về `{ user, token }`
4. Frontend lưu token vào `localStorage`
5. Mọi request sau đều gửi kèm token trong header: `Authorization: Bearer <token>`
6. Backend verify token và cho phép truy cập

## 🔧 Axios Interceptors

### Request Interceptor
Tự động thêm JWT token vào mọi request:
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

### Response Interceptor
- Tự động unwrap response data
- Handle errors (401 → logout, network error)
- Hiển thị error messages

## 📋 Cấu trúc Response

Tất cả API responses có format:
```javascript
{
  success: true/false,
  message: "Success message",
  data: { ... }, // hoặc array
  count: 10 // (optional) cho lists
}
```

## 🎨 UI Components đã tích hợp

### Login/Register
- Real-time validation
- Error handling
- Auto redirect sau login

### Create Product
- Form validation
- Blockchain transaction
- Success feedback với hash

### My Products
- Load from API
- Update status
- QR code generation

### Dashboard
- Real-time stats
- Blockchain info
- Recent products list

## 🐛 Debug & Testing

### Check API connection
```javascript
// In browser console
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log);
```

### Check authentication
```javascript
// In browser console
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
```

### API errors
Mở Developer Tools → Network tab để xem:
- Request headers (có token không?)
- Response status (401, 500, etc.)
- Response body (error messages)

## ⚠️ Lưu ý

1. **CORS**: Backend đã config CORS, nhưng nếu gặp lỗi, check `backend/server.js`
2. **Token expiry**: Token mặc định hết hạn sau 7 ngày
3. **MongoDB**: Đảm bảo MongoDB đang chạy
4. **Blockchain**: Đảm bảo Ganache/Hardhat node đang chạy
5. **Contract**: Deploy smart contract và update `CONTRACT_ADDRESS` trong `.env`

## 🔄 Migration từ Mock sang API

Các files sử dụng mock data cũ:
- `storage.js` - Không còn dùng cho production
- `blockchain.js` mock - Có thể giữ cho testing

Để chuyển đổi page khác:
1. Import `apiService` thay vì `storage/blockchain`
2. Thay `storageService.xxx()` → `await productAPI.xxx()`
3. Handle async/await và errors
4. Update object structure (id → _id, etc.)

## 📚 Next Steps

1. ✅ Update các pages còn lại (Transport, Store, Users Management)
2. ✅ Implement realtime updates (WebSocket/Polling)
3. ✅ Add loading states và error boundaries
4. ✅ Implement caching strategy
5. ✅ Add retry logic cho failed requests

## 🆘 Troubleshooting

### "Network Error"
- Check backend đang chạy
- Check VITE_API_URL đúng
- Check CORS settings

### "401 Unauthorized"
- Token expired → Login lại
- Token invalid → Clear localStorage
- Route cần auth → Đảm bảo đã login

### "500 Server Error"
- Check backend logs
- Check MongoDB connection
- Check blockchain connection

---

✨ **API integration hoàn tất!** Frontend giờ kết nối trực tiếp với backend và blockchain!
