# Frontend

Frontend của FoodChain được xây dựng bằng React + Vite + JavaScript, hỗ trợ dashboard theo từng vai trò, quản lý sản phẩm, vận chuyển, quét QR và blockchain logs.

## Công nghệ
- React 18.3.1
- Vite 6.3.5
- JavaScript (ES6+)
- React Router 7.13.0
- Tailwind CSS 4.1.12
- MUI 7.3.5
- Recharts 2.15.2
- Lucide React
- React QR Code
- Sonner

## Chức năng chính
- Đăng nhập / đăng ký
- Dashboard riêng cho ADMIN, MANUFACTURER, TRANSPORTER, STORE, CONSUMER
- Tạo lô sản phẩm và quản lý sản phẩm
- Theo dõi vận chuyển và lịch sử hành trình
- Nhận hàng tại cửa hàng
- Quét QR và tra cứu sản phẩm
- Blockchain logs có thể mở rộng chi tiết
- Route code-splitting và dashboard code-splitting theo role

## Cấu trúc chính
```text
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── dashboard/      # Dashboard theo role + shared UI
│   │   ├── contexts/           # Auth context
│   │   ├── pages/              # Page components
│   │   ├── services/           # API clients
│   │   └── routes.jsx          # Router + lazy loading
│   └── styles/                 # Global styles
├── package.json
├── vite.config.js
└── postcss.config.mjs
```

## Cài đặt
```bash
cd frontend
npm install
```

## Cấu hình API
Tạo file `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Chạy development
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5173

## Build production
```bash
npm run build
npm run preview
```

## Lưu ý về đăng nhập và giao dịch
- Frontend hiện hỗ trợ local dev không cần MetaMask cho mọi thao tác.
- Khi thực hiện transaction, hệ thống dùng walletAddress + private key tương ứng của user dev.
- Nếu đổi account, nên logout/login lại để tránh dính cache key cũ.

## Trang chính
- LoginPage
- DashboardPage
- CreateProductPage
- MyProductsPage
- ProductsManagementPage
- StoreProductsPage
- TransportPage
- ScanQRPage
- BlockchainLogsPage
- ProfilePage
- UsersManagementPage

## Troubleshooting
### Không gọi được API
- Kiểm tra backend đang chạy ở `http://localhost:3000`
- Kiểm tra `VITE_API_URL` trong `.env.local`

### Màn hình trống sau khi vào dashboard
- Reload cứng trình duyệt
- Kiểm tra đã đăng nhập đúng role chưa

### Chậm khi tải trang
- Ứng dụng đã tách route và dashboard theo lazy loading.
- Các page chỉ được tải khi cần.
