# 🎯 Product Traceability Feature - Complete Guide

## 📋 Overview

Feature **Product Traceability** cho phép người tiêu dùng quét mã QR trên sản phẩm để:
- ✅ Xác minh sản phẩm có thật hay giả
- 📜 Xem lịch sử hành trình đầy đủ (blockchain-verified)
- 🚚 Theo dõi chuỗi cung ứng: **Producer → Distributor → Retailer → Consumer**
- 🔐 Đảm bảo tính minh bạch và an toàn thực phẩm

## 🏗️ Architecture

```
┌─────────────────┐
│  Consumer QR    │
│  Code Scanner   │
└────────┬────────┘
         │ GET /api/products/:productId/traceability
         ↓
┌─────────────────────────────────────────┐
│  API Controller                         │
│  product.controller.js                  │
│  getProductTraceability()               │
└────────┬────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  Service Layer                          │
│  product.service.js                     │
│  getProductTraceability()               │
└────────┬────────────────────────────────┘
         │
         ├──────────────┬──────────────────┐
         ↓              ↓                  ↓
    ┌────────┐    ┌──────────┐    ┌──────────────┐
    │MongoDB │    │Blockchain│    │ Format       │
    │Cache   │    │Service   │    │ Journey Data │
    └────────┘    └──────────┘    └──────────────┘
         │              │                  │
         └──────────────┴──────────────────┘
                        ↓
         ┌──────────────────────────────┐
         │  JSON Response               │
         │  - Product Info              │
         │  - Journey Timeline          │
         │  - Blockchain History        │
         │  - Verification Status       │
         └──────────────────────────────┘
```

## 📁 Files Modified/Created

### Backend Files

1. **[services/blockchainService.js](services/blockchainService.js)**
   - ✅ Added `getProductHistory()` - Get full history from blockchain
   - ✅ Added `verifyProduct()` - Verify product exists on blockchain
   - ✅ Added `updateProductStatus()` - Update status on blockchain

2. **[services/product.service.js](services/product.service.js)**
   - ✅ Added `getProductTraceability()` - Main traceability logic
   - ✅ Added `formatProductJourney()` - Format journey data
   - ✅ Added `mapStatusToStage()` - Map status to supply chain stage
   - ✅ Added `getStageDescription()` - Get human-readable descriptions

3. **[controllers/product.controller.js](controllers/product.controller.js)**
   - ✅ Added `getProductTraceability()` - Controller for traceability endpoint

4. **[routes/productRoutes.js](routes/productRoutes.js)**
   - ✅ Added route: `GET /api/products/:productId/traceability`

5. **[test-traceability.js](test-traceability.js)** (NEW)
   - ✅ Complete test suite for traceability API
   - ✅ 4 test cases: existing product, non-existent, response format, performance

6. **[API_TRACEABILITY.md](API_TRACEABILITY.md)** (NEW)
   - ✅ Complete API documentation
   - ✅ Request/Response examples
   - ✅ Frontend integration examples (React, Vanilla JS)

### Updated Files

7. **[package.json](package.json)**
   - ✅ Added script: `npm run test:traceability`

## 🔄 Data Flow Explanation

### Scenario 1: Product exists in MongoDB (Fast Path)

```
1. User scans QR code → productId = "PROD-001"
2. API receives: GET /api/products/PROD-001/traceability
3. MongoDB query: Find product by productId ✅ Found
4. Blockchain query: Get full history (optional)
5. Format journey: Map statuses to stages
6. Return JSON with:
   - Product details
   - Journey timeline
   - Blockchain verification
```

**Response Time:** ~100-300ms

### Scenario 2: Product NOT in MongoDB (Blockchain Lookup)

```
1. User scans QR code → productId = "PROD-002"
2. API receives: GET /api/products/PROD-002/traceability
3. MongoDB query: Find product by productId ❌ Not Found
4. Blockchain query: Verify product exists
   - If exists: Get product details + history
   - If not: Return 404
5. Format response
6. Return JSON
```

**Response Time:** ~500-1000ms (blockchain read)

### Scenario 3: Product doesn't exist anywhere

```
1. User scans invalid QR code → productId = "INVALID"
2. API receives: GET /api/products/INVALID/traceability
3. MongoDB query: ❌ Not Found
4. Blockchain query: ❌ Not Found
5. Return 404 with message: "Product not found"
```

## 🎯 Supply Chain Stage Mapping

| Status (Backend) | Stage (Consumer View) | Description |
|------------------|----------------------|-------------|
| `MANUFACTURED` | **Producer** | Product manufactured and registered |
| `IN_TRANSIT` | **Distributor** | Product being transported |
| `IN_STORE` | **Retailer** | Product available at store |
| `SOLD` | **Consumer** | Product sold to end user |

## 📊 Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "verified": true,                    // ← Blockchain verified
  "dataSource": "blockchain",          // ← "blockchain" or "database"
  "data": {
    "product": { ... },                // ← Basic product info
    "journey": [                       // ← Supply chain timeline
      {
        "step": 1,
        "stage": "Producer",           // ← Human-readable stage
        "status": "MANUFACTURED",
        "location": "Đà Lạt",
        "timestamp": "2026-03-11T..."
      }
    ],
    "blockchainHistory": [ ... ],      // ← Raw blockchain data
    "summary": {
      "totalStages": 3,
      "currentStage": "Retailer",
      "isVerified": true,
      "verifiedBy": "Blockchain"
    }
  }
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "message": "Product not found in database or blockchain",
  "productId": "INVALID-ID",
  "verified": false
}
```

## 🧪 Testing

### Method 1: Automated Test Suite

```bash
# Run all tests (requires running server)
npm run test:traceability

# Test with specific product ID
npm run test:traceability PROD-001
```

**Test Cases:**
1. ✅ Get traceability for existing product
2. ✅ Handle non-existent product (404)
3. ✅ Validate response format and fields
4. ✅ Performance test (< 1s response time)

### Method 2: Manual Testing with curl

```bash
# Test existing product
curl http://localhost:3000/api/products/PROD-001/traceability | jq '.'

# Test non-existent product (should return 404)
curl http://localhost:3000/api/products/INVALID/traceability | jq '.'

# Check response time
curl -w "\nTime: %{time_total}s\n" \
  http://localhost:3000/api/products/PROD-001/traceability
```

### Method 3: Postman/Thunder Client

1. **Create Request**
   - Method: GET
   - URL: `http://localhost:3000/api/products/PROD-001/traceability`
   - Headers: None (public endpoint)

2. **Send Request**
   - Expected: 200 OK
   - Response: JSON with product info, journey, blockchain history

3. **Test Variations**
   - Valid productId → 200 OK
   - Invalid productId → 404 Not Found

## 🎨 Frontend Integration

### React Component Example

```jsx
// components/ProductScanner.jsx
import { useState } from 'react';
import { QrReader } from 'react-qr-reader';

function ProductScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [traceability, setTraceability] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (result) => {
    if (result) {
      setScanResult(result.text);
      setLoading(true);

      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${result.text}/traceability`
        );
        const data = await response.json();

        if (data.success) {
          setTraceability(data.data);
        } else {
          alert('Product not found!');
        }
      } catch (error) {
        console.error(error);
        alert('Failed to fetch product info');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>Scan QR Code</h2>
      <QrReader
        onResult={handleScan}
        constraints={{ facingMode: 'environment' }}
      />

      {loading && <p>Loading...</p>}

      {traceability && (
        <div>
          <h3>{traceability.product.name}</h3>
          
          {/* Verification Badge */}
          {traceability.summary.isVerified && (
            <span className="badge verified">
              ✅ Blockchain Verified
            </span>
          )}

          {/* Product Info */}
          <div>
            <p><strong>Origin:</strong> {traceability.product.origin}</p>
            <p><strong>Manufacturer:</strong> {traceability.product.manufacturer}</p>
            <p><strong>Status:</strong> {traceability.product.currentStatus}</p>
          </div>

          {/* Journey Timeline */}
          <h4>Supply Chain Journey</h4>
          <div className="timeline">
            {traceability.journey.map((step) => (
              <div key={step.step} className="timeline-step">
                <div className="step-number">{step.step}</div>
                <div className="step-content">
                  <h5>{step.stage}</h5>
                  <p>{step.description}</p>
                  <p className="location">📍 {step.location}</p>
                  <p className="date">
                    🕒 {new Date(step.timestamp).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductScanner;
```

### Usage in Existing ScanQRPage

```jsx
// Update frontend/src/app/pages/ScanQRPage.jsx
import { useState } from 'react';

function ScanQRPage() {
  const [productId, setProductId] = useState('');
  const [traceability, setTraceability] = useState(null);

  const handleScan = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/products/${productId}/traceability`
      );
      const data = await response.json();

      if (data.success) {
        setTraceability(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <input 
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Enter Product ID or Scan QR"
      />
      <button onClick={handleScan}>Scan</button>

      {traceability && (
        <TraceabilityView data={traceability} />
      )}
    </div>
  );
}
```

## 🚀 Deployment Checklist

### Before Production

- [ ] Enable rate limiting (100 req/min per IP)
- [ ] Add Redis caching for frequently scanned products
- [ ] Setup CDN for faster global access
- [ ] Configure CORS for production domains
- [ ] Add monitoring (response times, error rates)
- [ ] Implement API analytics
- [ ] Setup error tracking (Sentry)
- [ ] Add pagination for large histories

### Environment Variables

```env
# Production .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...  # MongoDB Atlas
RPC_URL=https://mainnet.infura.io/v3/...  # Ethereum mainnet
PRIVATE_KEY=...  # Production private key (secure!)
CONTRACT_ADDRESS=...  # Deployed contract address
JWT_SECRET=...  # Strong secret
CORS_ORIGIN=https://yourdomain.com
```

## 📈 Performance Optimization

### Database Indexing

```javascript
// Already indexed in Product.model.js
productSchema.index({ productId: 1 });  // Fast lookup
productSchema.index({ manufacturerAddress: 1 });
productSchema.index({ blockchainTxHash: 1 });
```

### Caching Strategy (Optional with Redis)

```javascript
// Pseudo-code for Redis caching
const cachedData = await redis.get(`traceability:${productId}`);
if (cachedData) {
  return JSON.parse(cachedData);
}

const data = await getProductTraceability(productId);
await redis.setex(`traceability:${productId}`, 300, JSON.stringify(data)); // 5 min cache
return data;
```

## 🐛 Troubleshooting

### Issue: "Product not found in database or blockchain"
**Solution:**
- Check if product exists: `GET /api/products`
- Verify blockchainService is initialized
- Check contract address in .env
- Ensure Ganache is running

### Issue: Slow response times (> 3s)
**Solution:**
- Check MongoDB connection
- Check blockchain RPC connection
- Add indexes to database
- Implement caching layer

### Issue: Blockchain history empty
**Solution:**
- Verify contract has `getProductHistory()` function
- Check if product was registered on blockchain
- View contract events in Ganache

### Issue: "Blockchain service not initialized"
**Solution:**
- Call `blockchainService.initialize()` in server.js
- Check RPC_URL and CONTRACT_ADDRESS in .env
- Ensure contract ABI is loaded

## 📚 Related Documentation

- [API_TRACEABILITY.md](API_TRACEABILITY.md) - Complete API documentation
- [BLOCKCHAIN_SETUP.md](BLOCKCHAIN_SETUP.md) - Blockchain setup guide
- [README_BLOCKCHAIN_SERVICE.md](services/README_BLOCKCHAIN_SERVICE.md) - BlockchainService API
- [QUICKSTART_BLOCKCHAIN.md](QUICKSTART_BLOCKCHAIN.md) - Quick start guide

## 🎯 Next Steps

1. ✅ Test traceability endpoint: `npm run test:traceability`
2. ✅ Integrate with frontend ScanQRPage
3. ✅ Add QR code scanner library (react-qr-reader)
4. ✅ Design UI for journey timeline
5. ✅ Add print QR code feature
6. ✅ Implement caching for better performance
7. ✅ Deploy to production

---

**🎉 Feature Complete!** Người tiêu dùng giờ có thể quét QR code và xem toàn bộ hành trình của sản phẩm từ nhà máy đến cửa hàng!
