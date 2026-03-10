# Food Traceability Frontend

## Giới Thiệu
Frontend application cho hệ thống truy xuất nguồn gốc thực phẩm, xây dựng bằng React + JavaScript + Vite.

## Công Nghệ
- React 18.3.1
- JavaScript (ES6+)
- Vite 6.3.5
- Tailwind CSS 4.1.12
- React Router 7.13.0
- Material-UI (MUI) 7.3.5
- React QR Code
- Recharts (Biểu đồ)

## Cấu Trúc Dự Án
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Reusable components
│   │   │   ├── figma/      # Figma components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── styles/             # Global styles
├── package.json
├── vite.config.js
└── postcss.config.mjs
```

## Cài Đặt

### 1. Yêu Cầu
- Node.js >= 16.x
- npm, pnpm hoặc yarn

### 2. Cài Đặt Dependencies
```bash
# Sử dụng npm
npm install

# Hoặc pnpm (khuyến nghị)
pnpm install

# Hoặc yarn
yarn install
```

### 3. Cấu Hình API
Tạo file `.env.local`:
```env
VITE_API_URL=http://localhost:8080/api
```

Hoặc sửa trong `src/app/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

### 4. Chạy Development Server
```bash
npm run dev
# hoặc
pnpm dev
# hoặc
yarn dev
```

Application sẽ chạy tại: http://localhost:5173

### 5. Build Production
```bash
npm run build
# hoặc
pnpm build

# Preview production build
npm run preview
```

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code (nếu có ESLint)

## Features

### Pages
- **LoginPage** - Đăng nhập/Đăng ký
- **DashboardPage** - Tổng quan hệ thống
- **CreateProductPage** - Tạo sản phẩm mới
- **MyProductsPage** - Quản lý sản phẩm của tôi
- **ProductsManagementPage** - Quản lý tất cả sản phẩm (Admin)
- **StoreProductsPage** - Kho sản phẩm
- **TransportPage** - Quản lý vận chuyển
- **ScanQRPage** - Quét QR code
- **BlockchainLogsPage** - Lịch sử blockchain
- **ProfilePage** - Thông tin cá nhân
- **UsersManagementPage** - Quản lý người dùng (Admin)

### Components
- UI Components: buttons, cards, dialogs, forms, tables, etc.
- Layout Components: sidebar, navbar, dashboard layout
- Custom Components: QR code scanner, blockchain viewer

## Docker

### Build Image
```bash
docker build -t food-traceability-frontend .
```

### Run Container
```bash
docker run -p 3000:80 food-traceability-frontend
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# App Configuration
VITE_APP_NAME=Food Traceability System
VITE_APP_VERSION=1.0.0
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port already in use
```bash
# Change port in package.json or run with different port
npm run dev -- --port 3000
```

### Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```
