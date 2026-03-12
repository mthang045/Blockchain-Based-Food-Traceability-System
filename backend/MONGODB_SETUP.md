# MongoDB Database Design - Food Traceability System

## 📋 Tổng quan

Hệ thống Food Traceability sử dụng MongoDB để lưu trữ dữ liệu với **6 Collections chính**:

1. **users** - Thông tin người dùng (admin, manufacturer, transporter, store, consumer)
2. **products** - Sản phẩm thực phẩm với lịch sử truy xuất nguồn gốc
3. **organizations** - Tổ chức/công ty trong chuỗi cung ứng
4. **transactions** - Giao dịch vận chuyển sản phẩm
5. **blockchainlogs** - Cache dữ liệu blockchain events
6. **qrcodes** - Quản lý QR code và scan history

---

## 🗄️ Chi tiết Collections

### 1. Collection: `users`

**Mục đích**: Quản lý tài khoản người dùng trong hệ thống

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String ["ADMIN", "MANUFACTURER", "TRANSPORTER", "STORE", "CONSUMER"],
  walletAddress: String,
  company: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `username` (unique)
- `email` (unique)
- `walletAddress` (sparse)
- `role`

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "producer01",
  "email": "producer@dalat.vn",
  "password": "$2a$10$...",
  "role": "MANUFACTURER",
  "walletAddress": "0x7fD311e28443fdF8A2027E81713Be04386081DAc",
  "company": "Dalat Fresh Farm",
  "isActive": true,
  "createdAt": "2026-03-12T10:00:00.000Z",
  "updatedAt": "2026-03-12T10:00:00.000Z"
}
```

---

### 2. Collection: `products`

**Mục đích**: Lưu trữ thông tin sản phẩm và lịch sử truy xuất nguồn gốc

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  productId: String (unique, required, indexed),
  name: String (required),
  description: String,
  category: String (required),
  producer: {
    name: String (required),
    address: String (required)
  },
  ipfsHash: String,
  ipfsUrl: String,
  transactionHash: String (indexed),
  blockchainAddress: String,
  status: String ["Pending", "Produced", "InTransit", "Delivered"],
  history: [
    {
      _id: ObjectId,
      actor: String,
      action: String,
      timestamp: Date,
      location: String,
      notes: String
    }
  ],
  qrCode: String,
  origin: String,
  batchNumber: String,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `productId` (unique)
- `transactionHash`
- `producer.address`
- `status`
- `category`
- `createdAt` (descending)

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "productId": "PROD-2026-001",
  "name": "Organic Apple",
  "description": "Fresh organic apples from Dalat highlands",
  "category": "Fruits",
  "producer": {
    "name": "Dalat Fresh Farm",
    "address": "0x7fD311e28443fdF8A2027E81713Be04386081DAc"
  },
  "ipfsHash": "QmXyz123...",
  "transactionHash": "0xa56a414e12a67ab4...",
  "status": "Produced",
  "history": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "actor": "Farmer Nguyen",
      "action": "Harvested",
      "timestamp": "2026-03-12T08:00:00.000Z",
      "location": "Dalat Farm",
      "notes": "Grade A quality"
    }
  ],
  "origin": "Dalat, Vietnam",
  "batchNumber": "BATCH-2026-03-001",
  "expiryDate": "2026-03-22T00:00:00.000Z",
  "createdAt": "2026-03-12T08:00:00.000Z",
  "updatedAt": "2026-03-12T08:30:00.000Z"
}
```

---

### 3. Collection: `organizations`

**Mục đích**: Quản lý thông tin các tổ chức/công ty trong chuỗi cung ứng

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  organizationId: String (unique, required, indexed),
  name: String (required),
  type: String ["MANUFACTURER", "FARM", "PROCESSOR", "DISTRIBUTOR", "WAREHOUSE", "RETAILER", "RESTAURANT"],
  description: String,
  walletAddress: String (unique, indexed),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contact: {
    name: String,
    phone: String,
    email: String,
    position: String
  },
  licenses: [
    {
      _id: ObjectId,
      licenseNumber: String,
      licenseType: String,
      issueDate: Date,
      expiryDate: Date,
      issuingAuthority: String,
      isValid: Boolean
    }
  ],
  certifications: [
    {
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateUrl: String
    }
  ],
  isVerified: Boolean,
  isActive: Boolean,
  rating: Number (0-5),
  totalProducts: Number,
  totalTransactions: Number,
  users: [ObjectId], // Reference to User
  metadata: {
    website: String,
    logoUrl: String,
    socialMedia: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `organizationId` (unique)
- `walletAddress` (unique, sparse)
- `type`, `isActive` (compound)
- `address.city`
- `name`, `description` (text search)

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "organizationId": "ORG-2026-DALAT-001",
  "name": "Dalat Fresh Farm",
  "type": "FARM",
  "walletAddress": "0x7fD311e28443fdF8A2027E81713Be04386081DAc",
  "address": {
    "street": "123 Highland Road",
    "city": "Dalat",
    "state": "Lam Dong",
    "postalCode": "670000",
    "country": "Vietnam"
  },
  "contact": {
    "name": "Nguyen Van A",
    "phone": "+84 912 345 678",
    "email": "contact@dalatfarm.vn",
    "position": "Director"
  },
  "licenses": [
    {
      "licenseNumber": "LIC-2026-001",
      "licenseType": "Food Production",
      "issueDate": "2026-01-01T00:00:00.000Z",
      "expiryDate": "2027-01-01T00:00:00.000Z",
      "issuingAuthority": "Vietnam Food Safety Department",
      "isValid": true
    }
  ],
  "isVerified": true,
  "isActive": true,
  "rating": 4.8,
  "totalProducts": 150,
  "totalTransactions": 320,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-03-12T00:00:00.000Z"
}
```

---

### 4. Collection: `transactions`

**Mục đích**: Theo dõi các giao dịch vận chuyển sản phẩm trong chuỗi cung ứng

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  transactionId: String (unique, required, indexed),
  product: ObjectId (ref: Product),
  productId: String (indexed),
  type: String ["PRODUCTION", "TRANSFER", "STORAGE", "SALE", "RETURN", "DISPOSAL"],
  from: {
    organizationId: ObjectId (ref: Organization),
    name: String,
    walletAddress: String,
    role: String ["SENDER", "RECEIVER", "TRANSPORTER"]
  },
  to: {
    organizationId: ObjectId,
    name: String,
    walletAddress: String,
    role: String
  },
  transporter: Object (optional),
  quantity: {
    amount: Number,
    unit: String
  },
  price: {
    amount: Number,
    currency: String
  },
  origin: {
    name: String,
    address: String,
    coordinates: { latitude: Number, longitude: Number }
  },
  destination: Object,
  status: String ["PENDING", "IN_TRANSIT", "COMPLETED", "CANCELLED", "FAILED"],
  blockchainTxHash: String (indexed),
  blockNumber: Number,
  documents: [
    {
      _id: ObjectId,
      name: String,
      type: String,
      url: String,
      uploadedAt: Date
    }
  ],
  shipmentDetails: {
    vehicle: String,
    driverName: String,
    driverPhone: String,
    licensePlate: String,
    departureTime: Date,
    arrivalTime: Date,
    estimatedArrival: Date
  },
  conditions: {
    temperature: Object,
    humidity: Object,
    notes: String
  },
  notes: String,
  verifiedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `transactionId` (unique)
- `productId`, `createdAt` (compound, descending)
- `from.organizationId`
- `to.organizationId`
- `type`, `status` (compound)
- `blockchainTxHash`

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "transactionId": "TXN-1710240000-ABC123",
  "product": "507f1f77bcf86cd799439012",
  "productId": "PROD-2026-001",
  "type": "TRANSFER",
  "from": {
    "organizationId": "507f1f77bcf86cd799439014",
    "name": "Dalat Fresh Farm",
    "walletAddress": "0x7fD311...",
    "role": "SENDER"
  },
  "to": {
    "organizationId": "507f1f77bcf86cd799439016",
    "name": "HCM Distribution Center",
    "walletAddress": "0x8eE421...",
    "role": "RECEIVER"
  },
  "quantity": {
    "amount": 500,
    "unit": "kg"
  },
  "price": {
    "amount": 50000000,
    "currency": "VND"
  },
  "origin": {
    "name": "Dalat Farm",
    "address": "Dalat, Lam Dong",
    "coordinates": { "latitude": 11.9404, "longitude": 108.4583 }
  },
  "destination": {
    "name": "HCM Warehouse",
    "address": "District 7, HCMC",
    "coordinates": { "latitude": 10.7769, "longitude": 106.7009 }
  },
  "status": "IN_TRANSIT",
  "shipmentDetails": {
    "vehicle": "Refrigerated Truck",
    "driverName": "Tran Van B",
    "driverPhone": "+84 909 876 543",
    "licensePlate": "51A-12345",
    "departureTime": "2026-03-12T06:00:00.000Z",
    "estimatedArrival": "2026-03-12T14:00:00.000Z"
  },
  "conditions": {
    "temperature": {
      "min": 2,
      "max": 8,
      "current": 5,
      "unit": "°C"
    }
  },
  "createdAt": "2026-03-12T06:00:00.000Z"
}
```

---

### 5. Collection: `blockchainlogs`

**Mục đích**: Cache dữ liệu blockchain transactions để truy vấn nhanh

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  transactionHash: String (unique, required, indexed),
  blockNumber: Number (required, indexed),
  blockHash: String (required),
  contractAddress: String (required, indexed),
  from: String (required, indexed),
  to: String (indexed),
  gasUsed: String (required),
  gasPrice: String,
  value: String,
  functionName: String (required, indexed),
  functionParams: Map,
  events: [
    {
      eventName: String,
      parameters: Map,
      logIndex: Number
    }
  ],
  status: String ["SUCCESS", "FAILED", "PENDING"],
  errorMessage: String,
  relatedEntity: {
    entityType: String ["PRODUCT", "TRANSACTION", "ORGANIZATION", "USER", "OTHER"],
    entityId: String (indexed),
    entityRef: ObjectId
  },
  blockTimestamp: Date (required, indexed),
  confirmations: Number,
  network: String ["development", "testnet", "mainnet"],
  chainId: Number,
  metadata: Object,
  isSynced: Boolean,
  lastSyncedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `transactionHash` (unique)
- `blockNumber`, `blockTimestamp` (compound, descending)
- `functionName`, `status` (compound)
- `relatedEntity.entityType`, `relatedEntity.entityId` (compound)
- `from`, `createdAt` (compound)
- `network`, `status` (compound)

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "transactionHash": "0xa56a414e12a67ab46fc8bb884307abf3855e0e28875eb6a70034eced76b118cb",
  "blockNumber": 5,
  "blockHash": "0x1234...",
  "contractAddress": "0xFf7148Ccaa4DAbc26e508823ec2CfB729f957c6b",
  "from": "0x7fD311e28443fdF8A2027E81713Be04386081DAc",
  "to": "0xFf7148Ccaa4DAbc26e508823ec2CfB729f957c6b",
  "gasUsed": "297975",
  "gasPrice": "20000000000",
  "functionName": "registerProduct",
  "functionParams": {
    "name": "Organic Apple",
    "origin": "Dalat, Vietnam",
    "ipfsHash": "QmTest123..."
  },
  "events": [
    {
      "eventName": "ProductRegistered",
      "parameters": {
        "productId": "PROD-2026-001",
        "producer": "0x7fD311...",
        "timestamp": "1710240000"
      },
      "logIndex": 0
    }
  ],
  "status": "SUCCESS",
  "relatedEntity": {
    "entityType": "PRODUCT",
    "entityId": "PROD-2026-001",
    "entityRef": "507f1f77bcf86cd799439012"
  },
  "blockTimestamp": "2026-03-12T08:00:00.000Z",
  "confirmations": 12,
  "network": "development",
  "chainId": 1337,
  "isSynced": true,
  "createdAt": "2026-03-12T08:00:05.000Z"
}
```

---

### 6. Collection: `qrcodes`

**Mục đích**: Quản lý QR codes và lịch sử scan

**Schema Structure**:
```javascript
{
  _id: ObjectId,
  qrCodeId: String (unique, required, indexed),
  product: ObjectId (ref: Product, required),
  productId: String (required, indexed),
  qrData: String (required),
  qrImageUrl: String,
  qrImageBase64: String,
  format: String ["PNG", "SVG", "JPEG", "PDF"],
  size: Number,
  verificationUrl: String (required),
  isActive: Boolean (indexed),
  isVerified: Boolean,
  expiryDate: Date (indexed),
  generatedBy: {
    userId: ObjectId (ref: User),
    organizationId: ObjectId (ref: Organization)
  },
  scanHistory: [
    {
      _id: ObjectId,
      scannedAt: Date,
      location: {
        latitude: Number,
        longitude: Number,
        city: String,
        country: String
      },
      device: {
        userAgent: String,
        ip: String,
        browser: String,
        os: String
      },
      scannedBy: {
        userId: ObjectId,
        role: String
      }
    }
  ],
  totalScans: Number (indexed),
  uniqueScans: Number,
  lastScannedAt: Date (indexed),
  metadata: Object,
  securityFeatures: {
    encryptionType: String,
    signature: String,
    checksum: String,
    secretKey: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `qrCodeId` (unique)
- `productId`, `isActive` (compound)
- `isActive`, `expiryDate` (compound)
- `totalScans` (descending)
- `createdAt` (descending)

**Sample Document**:
```json
{
  "_id": "507f1f77bcf86cd799439018",
  "qrCodeId": "QR-1710240000-XYZ789",
  "product": "507f1f77bcf86cd799439012",
  "productId": "PROD-2026-001",
  "qrData": "https://foodtrace.vn/verify/PROD-2026-001",
  "qrImageUrl": "https://ipfs.io/ipfs/QmQR123...",
  "format": "PNG",
  "size": 300,
  "verificationUrl": "https://foodtrace.vn/verify/PROD-2026-001",
  "isActive": true,
  "isVerified": true,
  "expiryDate": "2026-03-22T00:00:00.000Z",
  "generatedBy": {
    "userId": "507f1f77bcf86cd799439011",
    "organizationId": "507f1f77bcf86cd799439014"
  },
  "scanHistory": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "scannedAt": "2026-03-12T10:30:00.000Z",
      "location": {
        "latitude": 10.7769,
        "longitude": 106.7009,
        "city": "Ho Chi Minh City",
        "country": "Vietnam"
      },
      "device": {
        "userAgent": "Mozilla/5.0...",
        "ip": "118.69.xxx.xxx",
        "browser": "Chrome",
        "os": "Android"
      }
    }
  ],
  "totalScans": 25,
  "uniqueScans": 18,
  "lastScannedAt": "2026-03-12T10:30:00.000Z",
  "createdAt": "2026-03-12T08:00:00.000Z"
}
```

---

## 🔗 Relationships Between Collections

```
users ←→ organizations (users.company / organizations.users)
   ↓
products ← organizations (products.producer.address = organizations.walletAddress)
   ↓
   ├─→ transactions (transactions.product = products._id)
   ├─→ blockchainlogs (blockchainlogs.relatedEntity.entityRef = products._id)
   └─→ qrcodes (qrcodes.product = products._id)
```

---

## 📊 MongoDB Compass Setup Guide

### Bước 1: Kết nối MongoDB Compass

1. Mở **MongoDB Compass**
2. Connection String:
   ```
   mongodb://localhost:27017/food_traceability
   ```
3. Click **Connect**

### Bước 2: Tạo Database

1. Click **"+"** bên cạnh "Databases"
2. Database Name: `food_traceability`
3. Collection Name: `users` (tạo collection đầu tiên)
4. Click **Create Database**

### Bước 3: Tạo Collections

Tạo 5 collections còn lại:

1. Click vào database `food_traceability`
2. Click **"Create Collection"**
3. Tạo lần lượt: `products`, `organizations`, `transactions`, `blockchainlogs`, `qrcodes`

### Bước 4: Tạo Indexes (Quan trọng cho Performance)

#### Collection: users
```javascript
// Compass → users → Indexes → Create Index
{ "username": 1 } // unique
{ "email": 1 } // unique
{ "role": 1 }
{ "walletAddress": 1 }
```

#### Collection: products
```javascript
{ "productId": 1 } // unique
{ "transactionHash": 1 }
{ "producer.address": 1 }
{ "status": 1 }
{ "category": 1 }
{ "createdAt": -1 }
```

#### Collection: organizations
```javascript
{ "organizationId": 1 } // unique
{ "walletAddress": 1 } // unique
{ "type": 1, "isActive": 1 }
{ "address.city": 1 }
{ "name": "text", "description": "text" }
```

#### Collection: transactions
```javascript
{ "transactionId": 1 } // unique
{ "productId": 1, "createdAt": -1 }
{ "from.organizationId": 1 }
{ "to.organizationId": 1 }
{ "type": 1, "status": 1 }
{ "blockchainTxHash": 1 }
```

#### Collection: blockchainlogs
```javascript
{ "transactionHash": 1 } // unique
{ "blockNumber": -1, "blockTimestamp": -1 }
{ "functionName": 1, "status": 1 }
{ "relatedEntity.entityType": 1, "relatedEntity.entityId": 1 }
{ "from": 1, "createdAt": -1 }
{ "network": 1, "status": 1 }
```

#### Collection: qrcodes
```javascript
{ "qrCodeId": 1 } // unique
{ "productId": 1, "isActive": 1 }
{ "isActive": 1, "expiryDate": 1 }
{ "totalScans": -1 }
{ "createdAt": -1 }
```

### Bước 5: Import Sample Data (Optional)

1. Click vào collection
2. Click **"Add Data"** → **"Import File"**
3. Chọn file JSON với sample data
4. Click **Import**

### Bước 6: Validation Rules (Optional)

MongoDB Compass → Collection → Validation → Add Rule

Example cho `products`:
```javascript
{
  $jsonSchema: {
    bsonType: "object",
    required: ["productId", "name", "category", "producer"],
    properties: {
      productId: {
        bsonType: "string",
        description: "Product ID must be a string and is required"
      },
      name: {
        bsonType: "string",
        description: "Product name must be a string and is required"
      },
      status: {
        enum: ["Pending", "Produced", "InTransit", "Delivered"],
        description: "Status must be one of the enum values"
      }
    }
  }
}
```

---

## 🔍 Common Queries

### Query 1: Tìm tất cả products của một organization
```javascript
db.products.find({
  "producer.address": "0x7fD311e28443fdF8A2027E81713Be04386081DAc"
})
```

### Query 2: Tìm transactions đang in transit
```javascript
db.transactions.find({
  status: "IN_TRANSIT"
}).sort({ createdAt: -1 })
```

### Query 3: Tìm products với QR code đã được scan nhiều lần
```javascript
db.qrcodes.aggregate([
  { $match: { isActive: true } },
  { $sort: { totalScans: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productDetails"
    }
  }
])
```

### Query 4: Blockchain transaction statistics
```javascript
db.blockchainlogs.aggregate([
  { $match: { network: "development" } },
  {
    $group: {
      _id: "$functionName",
      count: { $sum: 1 },
      successCount: {
        $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] }
      }
    }
  }
])
```

---

## 💡 Best Practices

1. **Indexes**: Luôn tạo indexes cho các fields thường query (productId, transactionHash, status, createdAt)
2. **Validation**: Sử dụng schema validation để đảm bảo data integrity
3. **Backup**: Backup database định kỳ (daily recommended)
4. **Monitoring**: Monitor query performance bằng MongoDB Compass
5. **Sharding**: Cân nhắc sharding nếu data > 1TB
6. **Aggregation**: Sử dụng aggregation pipeline cho complex queries

---

## 📝 Environment Configuration

File `.env` cần có:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/food_traceability
DB_NAME=food_traceability
```

File `backend/config/database.config.js`:
```javascript
const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
```

---

## 🚀 Next Steps

1. ✅ Tạo database và collections trong MongoDB Compass
2. ✅ Tạo indexes cho performance
3. ✅ Import sample data để test
4. ☐ Kết nối backend với MongoDB
5. ☐ Test CRUD operations
6. ☐ Implement API endpoints
7. ☐ Test với blockchain integration

---

**Created by**: Food Traceability Team  
**Date**: March 12, 2026  
**Version**: 1.0
