# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy dự án Food Traceability System.

## 📋 Chuẩn Bị

### Yêu Cầu
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.8+

## 🏃 Chạy Development Mode

### Option 1: Chạy Riêng Từng Phần (Development)

#### 1. Setup Database
```bash
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE food_traceability;
```

#### 2. Chạy Backend
```bash
# Terminal 1 - Backend
cd backend

# Sửa file src/main/resources/application.properties
# Cập nhật database username/password

# Build và chạy
mvn spring-boot:run

# Backend sẽ chạy tại: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

#### 3. Chạy Frontend
```bash
# Terminal 2 - Frontend
cd frontend

# Cài đặt dependencies (lần đầu tiên)
npm install
# hoặc: pnpm install

# Chạy dev server
npm run dev
# hoặc: pnpm dev

# Frontend sẽ chạy tại: http://localhost:5173
```

#### 4. Truy Cập Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- API Docs: http://localhost:8080/swagger-ui.html

### Option 2: Chạy Với Docker (Production-like)

```bash
# Đảm bảo Docker đã cài đặt và chạy

# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Truy cập:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080/api
# - Swagger: http://localhost:8080/swagger-ui.html

# Dừng services
docker-compose down
```

## 🧪 Test API

### Test Health Check
```bash
# Test backend health
curl http://localhost:8080/api/health

# Response:
# {
#   "status": "UP",
#   "service": "Food Traceability Backend API",
#   "version": "1.0.0",
#   "timestamp": "...",
#   "message": "Service is running successfully! 🚀"
# }
```

### Test với Postman
1. Import collection từ `postman/` (nếu có)
2. Hoặc test manually:
   - GET http://localhost:8080/api/health
   - GET http://localhost:8080/api/info

## 📁 Cấu Trúc Project

```
Blockchain_Nhom13/
├── backend/          # Java Spring Boot Backend
│   ├── src/
│   ├── pom.xml
│   └── README.md    # Chi tiết về backend
│
├── frontend/        # React Frontend
│   ├── src/
│   ├── package.json
│   └── README.md    # Chi tiết về frontend
│
├── docker-compose.yml
└── README.md        # Documentation chính
```

## 🔧 Troubleshooting

### Backend không chạy được
```bash
# Kiểm tra Java version
java -version  # Phải >= 17

# Kiểm tra Maven
mvn -version

# Kiểm tra database connection trong application.properties
```

### Frontend không chạy được
```bash
# Xóa node_modules và cài lại
cd frontend
rm -rf node_modules
npm install

# Kiểm tra port có bị chiếm không
```

### Database connection error
```bash
# Kiểm tra MySQL đang chạy
# Windows:
net start MySQL80

# Kiểm tra user và password trong application.properties
```

## 📚 Tài Liệu Chi Tiết

- [Backend README](backend/README.md) - API documentation & backend setup
- [Frontend README](frontend/README.md) - Frontend components & setup
- [Main README](README.md) - Project overview & architecture

## 🆘 Support

Nếu gặp vấn đề, kiểm tra:
1. Logs của backend: `backend/logs/` hoặc console output
2. Browser console cho frontend errors
3. Database connection và credentials
4. Port conflicts (8080 cho backend, 5173 cho frontend dev)

## ✅ Checklist Trước Khi Chạy

- [ ] Java 17+ đã cài đặt
- [ ] Node.js 16+ đã cài đặt
- [ ] MySQL đang chạy
- [ ] Database `food_traceability` đã tạo
- [ ] Port 8080 và 5173 không bị chiếm
- [ ] Dependencies đã cài (Maven cho backend, npm cho frontend)

---

**Ready to go?** Chạy backend trước, sau đó chạy frontend! 🚀
