# Food Traceability Backend API

## Giới Thiệu
Backend API cho hệ thống truy xuất nguồn gốc thực phẩm, xây dựng bằng Java Spring Boot và tích hợp blockchain.

## Công Nghệ
- Java 17
- Spring Boot 3.2.3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- MySQL
- Web3j (Ethereum integration)
- Swagger/OpenAPI

## Cấu Trúc Dự Án
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/blockchain/food/
│   │   │   ├── FoodTraceabilityApplication.java
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── model/           # Entity models
│   │   │   ├── repository/      # JPA Repositories
│   │   │   ├── service/         # Business logic
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── security/        # Security components
│   │   │   └── exception/       # Exception handlers
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       └── application-prod.properties
│   └── test/
└── pom.xml
```

## Cài Đặt

### 1. Yêu Cầu
- JDK 17 trở lên
- Maven 3.8+
- MySQL 8.0+

### 2. Cấu Hình Database
```sql
CREATE DATABASE food_traceability;
CREATE USER 'fooduser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON food_traceability.* TO 'fooduser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Cấu Hình Application
Sửa `src/main/resources/application.properties`:
```properties
spring.datasource.username=fooduser
spring.datasource.password=yourpassword
jwt.secret=your-secret-key-here
```

### 4. Build & Run
```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run

# Hoặc chạy với profile dev
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Server sẽ chạy tại: http://localhost:8080

## API Documentation
Truy cập Swagger UI: http://localhost:8080/swagger-ui.html

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/{id}` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/products/{id}` - Xóa sản phẩm

### Supply Chain
- `GET /api/supply-chain/{productId}` - Lấy lịch sử chuỗi cung ứng
- `POST /api/supply-chain` - Thêm bước vận chuyển
- `PUT /api/supply-chain/{id}` - Cập nhật trạng thái

### Blockchain
- `GET /api/blockchain/transactions` - Lấy danh sách transactions
- `GET /api/blockchain/verify/{hash}` - Xác minh transaction
- `POST /api/blockchain/write` - Ghi dữ liệu lên blockchain

### Users (Admin)
- `GET /api/users` - Lấy danh sách người dùng
- `PUT /api/users/{id}` - Cập nhật người dùng
- `DELETE /api/users/{id}` - Xóa người dùng

## Testing
```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=ProductControllerTest
```

## Docker
```bash
# Build image
docker build -t food-traceability-backend .

# Run container
docker run -p 8080:8080 food-traceability-backend
```

## Environment Variables
```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=food_traceability
DB_USERNAME=root
DB_PASSWORD=password
JWT_SECRET=your-secret-key
BLOCKCHAIN_URL=http://localhost:8545
```
