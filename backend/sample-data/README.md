# Hướng dẫn Import Sample Data vào MongoDB Compass

## Các bước thực hiện

### 1. Mở MongoDB Compass
- Kết nối với database: `mongodb://localhost:27017/food_traceability`

### 2. Import Users
1. Click vào collection **users**
2. Click nút **"Add Data"** → **"Import JSON or CSV file"**
3. Chọn file: `backend/sample-data/users.json`
4. Click **"Import"**
5. Xem kết quả: 5 users được import

### 3. Import Organizations
1. Click vào collection **organizations**
2. Click **"Add Data"** → **"Import JSON or CSV file"**
3. Chọn file: `backend/sample-data/organizations.json`
4. Click **"Import"**
5. Xem kết quả: 3 organizations được import

### 4. Import Products
1. Click vào collection **products**
2. Click **"Add Data"** → **"Import JSON or CSV file"**
3. Chọn file: `backend/sample-data/products.json`
4. Click **"Import"**
5. Xem kết quả: 3 products được import

## Kiểm tra kết quả

### Verify Users
```javascript
db.users.find({}).count()  // Should return 5
db.users.find({ role: "MANUFACTURER" })  // Should find Dalat Farm user
```

### Verify Organizations
```javascript
db.organizations.find({}).count()  // Should return 3
db.organizations.find({ type: "FARM" })  // Should find Dalat Fresh Farm
```

### Verify Products
```javascript
db.products.find({}).count()  // Should return 3
db.products.find({ status: "Delivered" })  // Should find apples
db.products.find({ category: "Fruits" })  // Should find apples
```

## Thông tin đăng nhập test

### Admin Account
- Username: `admin`
- Email: `admin@foodtrace.vn`
- Password: `password123` (unhashed: dùng để test)

### Producer Account
- Username: `dalat_farm`
- Email: `producer@dalatfarm.vn`
- Wallet: `0x7fD311e28443fdF8A2027E81713Be04386081DAc`

### Transporter Account
- Username: `hcm_logistics`
- Email: `transport@hcmlogistics.vn`

### Store Account
- Username: `coopmart_store`
- Email: `store@coopmart.vn`

### Consumer Account
- Username: `consumer01`
- Email: `consumer@example.vn`

## Lưu ý

- Tất cả passwords trong sample data đã được hash bằng bcrypt
- Password gốc (để test): `password123`
- Wallet addresses và transaction hashes là sample data
- Blockchain transaction hashes cần cập nhật sau khi deploy smart contract thực

## Tạo thêm sample data

Nếu cần tạo thêm data, sử dụng format tương tự và import theo cách trên.

## Xóa sample data

Nếu muốn xóa và import lại:
```javascript
db.users.deleteMany({})
db.organizations.deleteMany({})
db.products.deleteMany({})
```

Sau đó import lại từ đầu.
