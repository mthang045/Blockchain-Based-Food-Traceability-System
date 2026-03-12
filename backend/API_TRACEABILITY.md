# 📱 Product Traceability API - QR Code Scanning

## 🎯 Mục đích

API endpoint này được thiết kế cho **người tiêu dùng** quét mã QR trên sản phẩm để:
- ✅ Xác minh tính xác thực của sản phẩm
- 📜 Xem lịch sử hành trình đầy đủ của sản phẩm
- 🔗 Kiểm tra thông tin từ blockchain
- 🚚 Theo dõi chuỗi cung ứng (Producer → Distributor → Retailer → Consumer)

## 🔗 Endpoint

```
GET /api/products/:productId/traceability
```

**Access:** Public (không cần authentication)

## 📋 Request

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | string | Yes | Product ID hoặc Batch ID từ mã QR |

### Example Request

```bash
# Using curl
curl http://localhost:3000/api/products/PROD-001/traceability

# Using fetch in JavaScript
fetch('http://localhost:3000/api/products/PROD-001/traceability')
  .then(response => response.json())
  .then(data => console.log(data));
```

## ✅ Response - Success (200 OK)

```json
{
  "success": true,
  "message": "Product traceability retrieved successfully",
  "verified": true,
  "dataSource": "blockchain",
  "data": {
    "product": {
      "productId": "PROD-001",
      "name": "Rau xanh hữu cơ",
      "description": "Rau xanh trồng hữu cơ không thuốc trừ sâu",
      "category": "Rau củ",
      "origin": "Đà Lạt, Việt Nam",
      "manufacturer": "Nông trại ABC",
      "manufacturerAddress": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
      "currentStatus": "IN_STORE",
      "qrCode": "QR-PROD-001-2026",
      "blockchainTxHash": "0xabcd1234...",
      "registeredDate": "2026-03-11T08:30:00.000Z",
      "lastUpdated": "2026-03-11T14:20:00.000Z"
    },
    "journey": [
      {
        "step": 1,
        "stage": "Producer",
        "status": "MANUFACTURED",
        "location": "Đà Lạt, Việt Nam",
        "updatedBy": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        "timestamp": "2026-03-11T08:30:00.000Z",
        "description": "Product manufactured and registered"
      },
      {
        "step": 2,
        "stage": "Distributor",
        "status": "IN_TRANSIT",
        "location": "Warehouse Sài Gòn",
        "updatedBy": "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
        "timestamp": "2026-03-11T10:15:00.000Z",
        "description": "Product in transit to distribution center or store"
      },
      {
        "step": 3,
        "stage": "Retailer",
        "status": "IN_STORE",
        "location": "Cửa hàng Co.op Mart Q1",
        "updatedBy": "0x1234567890abcdef1234567890abcdef12345678",
        "timestamp": "2026-03-11T14:20:00.000Z",
        "description": "Product available at retail store"
      }
    ],
    "blockchainHistory": [
      {
        "status": "MANUFACTURED",
        "updatedBy": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        "timestamp": 1710145800,
        "date": "2026-03-11T08:30:00.000Z",
        "location": "Đà Lạt, Việt Nam"
      },
      {
        "status": "IN_TRANSIT",
        "updatedBy": "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
        "timestamp": 1710152100,
        "date": "2026-03-11T10:15:00.000Z",
        "location": "Warehouse Sài Gòn"
      },
      {
        "status": "IN_STORE",
        "updatedBy": "0x1234567890abcdef1234567890abcdef12345678",
        "timestamp": 1710166800,
        "date": "2026-03-11T14:20:00.000Z",
        "location": "Cửa hàng Co.op Mart Q1"
      }
    ],
    "summary": {
      "totalStages": 3,
      "currentStage": "Retailer",
      "currentStatus": "IN_STORE",
      "isVerified": true,
      "verifiedBy": "Blockchain"
    }
  },
  "timestamp": "2026-03-11T15:30:00.000Z"
}
```

## ❌ Response - Product Not Found (404 Not Found)

```json
{
  "success": false,
  "message": "Product not found in database or blockchain",
  "productId": "PROD-999",
  "verified": false
}
```

## ❌ Response - Invalid Request (400 Bad Request)

```json
{
  "success": false,
  "message": "Product ID is required"
}
```

## ❌ Response - Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to retrieve product traceability",
  "error": "Error details (only in development mode)"
}
```

## 🔄 Data Flow

```
User Scans QR Code
        ↓
GET /api/products/:productId/traceability
        ↓
Controller: getProductTraceability
        ↓
Service: getProductTraceability
        ↓
    ┌─────────────────┐
    │ Check MongoDB   │ ← First (Cache)
    └────────┬────────┘
             │
             ↓
    Product Found?
             ├─ Yes → Get Blockchain History (optional)
             │
             └─ No → Check Blockchain Directly
                      ↓
                  Product Found?
                      ├─ Yes → Get History & Format
                      └─ No → Return 404
        ↓
Format Journey (Producer → Distributor → Retailer)
        ↓
Return JSON Response
```

## 🎨 Frontend Integration

### React Example

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProductTraceabilityPage() {
  const { productId } = useParams();
  const [traceability, setTraceability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTraceability = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/products/${productId}/traceability`
        );
        const data = await response.json();

        if (!data.success) {
          setError(data.message);
        } else {
          setTraceability(data.data);
        }
      } catch (err) {
        setError('Failed to load product information');
      } finally {
        setLoading(false);
      }
    };

    fetchTraceability();
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!traceability) return <div>Product not found</div>;

  return (
    <div>
      <h1>{traceability.product.name}</h1>
      
      {/* Product Info */}
      <section>
        <h2>Product Information</h2>
        <p>Origin: {traceability.product.origin}</p>
        <p>Manufacturer: {traceability.product.manufacturer}</p>
        <p>Status: {traceability.product.currentStatus}</p>
        {traceability.summary.isVerified && (
          <span className="verified-badge">✅ Blockchain Verified</span>
        )}
      </section>

      {/* Journey Timeline */}
      <section>
        <h2>Supply Chain Journey</h2>
        <div className="timeline">
          {traceability.journey.map((step) => (
            <div key={step.step} className="timeline-item">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3>{step.stage}</h3>
                <p>{step.description}</p>
                <p>Location: {step.location}</p>
                <p>Date: {new Date(step.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blockchain History */}
      {traceability.blockchainHistory && (
        <section>
          <h2>Blockchain Records</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Location</th>
                <th>Date</th>
                <th>Updated By</th>
              </tr>
            </thead>
            <tbody>
              {traceability.blockchainHistory.map((record, index) => (
                <tr key={index}>
                  <td>{record.status}</td>
                  <td>{record.location}</td>
                  <td>{new Date(record.date).toLocaleString()}</td>
                  <td title={record.updatedBy}>
                    {record.updatedBy.slice(0, 10)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default ProductTraceabilityPage;
```

### Vanilla JavaScript Example

```javascript
// Get product ID from QR code scan or URL
const productId = 'PROD-001';

// Fetch traceability data
async function loadProductTraceability(productId) {
  const loader = document.getElementById('loader');
  const errorDiv = document.getElementById('error');
  const contentDiv = document.getElementById('content');

  loader.style.display = 'block';
  errorDiv.style.display = 'none';
  contentDiv.innerHTML = '';

  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}/traceability`
    );
    const result = await response.json();

    if (!result.success) {
      errorDiv.textContent = result.message;
      errorDiv.style.display = 'block';
      return;
    }

    const { product, journey, summary } = result.data;

    // Display product info
    contentDiv.innerHTML = `
      <div class="product-card">
        <h2>${product.name}</h2>
        ${summary.isVerified ? '<span class="badge verified">✅ Blockchain Verified</span>' : ''}
        <p><strong>Origin:</strong> ${product.origin}</p>
        <p><strong>Manufacturer:</strong> ${product.manufacturer}</p>
        <p><strong>Current Status:</strong> ${product.currentStatus}</p>
        <p><strong>Registered:</strong> ${new Date(product.registeredDate).toLocaleString()}</p>
      </div>

      <div class="journey">
        <h3>Supply Chain Journey</h3>
        ${journey.map(step => `
          <div class="journey-step">
            <div class="step-number">${step.step}</div>
            <div class="step-info">
              <h4>${step.stage}</h4>
              <p>${step.description}</p>
              <p class="location">📍 ${step.location}</p>
              <p class="timestamp">🕒 ${new Date(step.timestamp).toLocaleString()}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

  } catch (error) {
    errorDiv.textContent = 'Failed to load product information';
    errorDiv.style.display = 'block';
  } finally {
    loader.style.display = 'none';
  }
}

// Call on page load
loadProductTraceability(productId);
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Test with existing product
curl http://localhost:3000/api/products/PROD-001/traceability

# Test with non-existent product
curl http://localhost:3000/api/products/INVALID-ID/traceability

# Test with formatted output (using jq)
curl http://localhost:3000/api/products/PROD-001/traceability | jq '.'
```

### Postman/Thunder Client

1. **Method:** GET
2. **URL:** `http://localhost:3000/api/products/PROD-001/traceability`
3. **Headers:** None required (public endpoint)
4. **Expected Status:** 200 OK

## 📊 Response Fields Explained

### Product Object
- `productId`: Unique identifier (from QR code)
- `name`: Product name
- `origin`: Where product was manufactured
- `manufacturer`: Manufacturer name
- `manufacturerAddress`: Ethereum address of manufacturer
- `currentStatus`: Latest status (MANUFACTURED, IN_TRANSIT, IN_STORE, SOLD)
- `blockchainTxHash`: Transaction hash of blockchain registration

### Journey Array
- `step`: Sequential step number (1, 2, 3...)
- `stage`: Role in supply chain (Producer, Distributor, Retailer, Consumer)
- `status`: Technical status code
- `location`: Physical location at this step
- `updatedBy`: Ethereum address who updated status
- `timestamp`: ISO 8601 date string
- `description`: Human-readable description

### Summary Object
- `totalStages`: Total number of stages in journey
- `currentStage`: Current position in supply chain
- `currentStatus`: Current technical status
- `isVerified`: Whether data comes from blockchain
- `verifiedBy`: Data source (Blockchain or Database)

## 🔐 Security Notes

- ✅ This endpoint is **public** - no authentication required
- ⚠️ Rate limiting should be implemented in production
- 🔒 Blockchain data is immutable and tamper-proof
- 📊 Database serves as cache for faster response times

## 🚀 Production Checklist

- [ ] Implement rate limiting (e.g., 100 requests/minute per IP)
- [ ] Add caching layer (Redis) for frequently accessed products
- [ ] Setup CDN for faster global access
- [ ] Add monitoring and logging
- [ ] Configure CORS for your frontend domains
- [ ] Implement API analytics
- [ ] Add pagination for large blockchain histories
- [ ] Setup error tracking (Sentry, etc.)

## 📞 Support

For issues or questions:
- 📧 Backend API: Check server logs
- 🔗 Blockchain: Verify Ganache is running
- 💾 Database: Check MongoDB connection
- 🐛 Bug reports: Create GitHub issue

---

**🎉 API Ready!** Bây giờ người tiêu dùng có thể quét QR code và xem hành trình đầy đủ của sản phẩm!
