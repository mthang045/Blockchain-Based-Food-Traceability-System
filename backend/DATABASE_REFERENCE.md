# Food Traceability Database - Quick Reference

## 📊 Collections Summary

| Collection | Purpose | Key Fields | Indexes |
|---|---|---|---|
| **users** | User accounts | username, email, role, walletAddress | username, email, role |
| **products** | Food products | productId, name, status, producer | productId, transactionHash, status |
| **organizations** | Companies/Farms | organizationId, type, walletAddress | organizationId, walletAddress, type |
| **transactions** | Supply chain movements | transactionId, productId, from, to, status | transactionId, productId, status |
| **blockchainlogs** | Blockchain cache | transactionHash, blockNumber, functionName | transactionHash, blockNumber, functionName |
| **qrcodes** | QR code tracking | qrCodeId, productId, totalScans | qrCodeId, productId, totalScans |

## 🔗 Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Relationships                    │
└─────────────────────────────────────────────────────────────┘

         ┌──────────┐
         │  users   │
         └────┬─────┘
              │ company
              │ walletAddress
              ▼
    ┌──────────────────┐
    │ organizations    │◄──────┐
    └────┬─────────────┘       │
         │ walletAddress       │
         │                     │ from/to
         ▼                     │
    ┌──────────┐               │
    │ products │◄──────────────┤
    └────┬─────┘               │
         │ productId           │
         │                     │
         ├─────────────────────┤
         │                     │
         ▼                     ▼
    ┌──────────┐        ┌──────────────┐
    │ qrcodes  │        │ transactions │
    └──────────┘        └──────────────┘
              ▲
              │ relatedEntity
              │
         ┌────┴──────────┐
         │ blockchainlogs│
         └───────────────┘
```

## 💾 Storage Estimates

| Collection | Docs | Avg Size | Total Size |
|---|---|---|---|
| users | ~1,000 | 1 KB | ~1 MB |
| organizations | ~500 | 2 KB | ~1 MB |
| products | ~10,000 | 3 KB | ~30 MB |
| transactions | ~50,000 | 2 KB | ~100 MB |
| blockchainlogs | ~100,000 | 1.5 KB | ~150 MB |
| qrcodes | ~10,000 | 4 KB | ~40 MB |
| **Total** | | | **~322 MB** |

## 🚀 Performance Tips

### Most Important Indexes
1. `products.productId` (unique) - Product lookup
2. `transactions.productId + createdAt` (compound) - Supply chain history
3. `blockchainlogs.transactionHash` (unique) - Blockchain verification
4. `qrcodes.qrCodeId` (unique) - QR scan lookup
5. `organizations.walletAddress` (unique) - Blockchain integration

### Query Optimization
- Always use indexed fields in `$match` stages
- Limit results with `.limit()` for pagination
- Use aggregation pipeline for complex queries
- Add `createdAt` descending for recent-first sorting

## 📍 Common Query Patterns

### 1. Get Product Full Traceability
```javascript
// Step 1: Get product details
const product = await db.products.findOne({ productId: "PROD-2026-001" });

// Step 2: Get all transactions
const transactions = await db.transactions.find({ 
  productId: product.productId 
}).sort({ createdAt: 1 });

// Step 3: Get blockchain logs
const logs = await db.blockchainlogs.find({
  "relatedEntity.entityId": product.productId
}).sort({ blockTimestamp: 1 });

// Step 4: Get QR codes
const qrCodes = await db.qrcodes.find({
  productId: product.productId
});
```

### 2. Get Organization Products
```javascript
const products = await db.products.find({
  "producer.address": organization.walletAddress
}).sort({ createdAt: -1 }).limit(50);
```

### 3. Get Active In-Transit Shipments
```javascript
const shipments = await db.transactions.find({
  status: "IN_TRANSIT"
}).sort({ "shipmentDetails.estimatedArrival": 1 });
```

### 4. Get Most Scanned Products
```javascript
const topProducts = await db.qrcodes.aggregate([
  { $match: { isActive: true } },
  { $sort: { totalScans: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "productId",
      as: "product"
    }
  }
]);
```

## 🔧 Maintenance Tasks

### Daily
- [ ] Backup database: `mongodump --db food_traceability`
- [ ] Check disk space: `db.stats()`
- [ ] Monitor slow queries: Check MongoDB logs

### Weekly
- [ ] Analyze index usage: `db.products.getIndexes()`
- [ ] Check collection sizes: `db.stats()`
- [ ] Clean up old logs (>90 days)

### Monthly
- [ ] Optimize indexes: Remove unused indexes
- [ ] Archive old data
- [ ] Update aggregation statistics

## 🎯 Business Metrics Queries

### Products Created Today
```javascript
db.products.count({
  createdAt: {
    $gte: new Date(new Date().setHours(0,0,0,0))
  }
});
```

### Transactions Completed This Week
```javascript
const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - 7);

db.transactions.count({
  status: "COMPLETED",
  completedAt: { $gte: weekStart }
});
```

### Total QR Scans Today
```javascript
const today = new Date(new Date().setHours(0,0,0,0));

db.qrcodes.aggregate([
  {
    $match: {
      "scanHistory.scannedAt": { $gte: today }
    }
  },
  {
    $project: {
      todayScans: {
        $size: {
          $filter: {
            input: "$scanHistory",
            cond: { $gte: ["$$this.scannedAt", today] }
          }
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      totalScans: { $sum: "$todayScans" }
    }
  }
]);
```

### Average Transaction Duration
```javascript
db.transactions.aggregate([
  {
    $match: {
      status: "COMPLETED",
      "shipmentDetails.departureTime": { $exists: true },
      "shipmentDetails.arrivalTime": { $exists: true }
    }
  },
  {
    $project: {
      duration: {
        $divide: [
          {
            $subtract: [
              "$shipmentDetails.arrivalTime",
              "$shipmentDetails.departureTime"
            ]
          },
          3600000
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      avgDurationHours: { $avg: "$duration" }
    }
  }
]);
```

## 📱 Connection Strings

### Local Development
```
mongodb://localhost:27017/food_traceability
```

### Production (MongoDB Atlas)
```
mongodb+srv://<username>:<password>@cluster.mongodb.net/food_traceability?retryWrites=true&w=majority
```

### Docker Compose
```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: food_traceability
    volumes:
      - mongodb_data:/data/db
```

---

**Last Updated**: March 12, 2026  
**Version**: 1.0  
**Database**: MongoDB 7.0
