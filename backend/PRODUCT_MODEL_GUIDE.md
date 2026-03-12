# 📦 Product Model - Complete Guide

## Overview

The **Product Model** is a comprehensive Mongoose schema designed for a Food Traceability System. It tracks products throughout the entire supply chain from production to delivery, integrating with blockchain and IPFS for maximum transparency and security.

## Schema Structure

### Core Fields

#### 1. Product Identification

```javascript
productId: {
  type: String,
  required: true,
  unique: true,
  description: 'Unique product ID from blockchain'
}
```

- **Purpose**: Unique identifier synced with blockchain
- **Format**: `PROD-YYYY-XXX` or blockchain-generated ID
- **Example**: `"PROD-2024-001"`
- **Note**: This should match the product ID on the smart contract

#### 2. Basic Information

```javascript
name: {
  type: String,
  required: true
}

description: {
  type: String
}

category: {
  type: String,
  required: true
}
```

- **name**: Product name (e.g., "Organic Green Vegetables")
- **description**: Detailed description
- **category**: Product category - "Vegetables", "Fruits", "Meat", "Dairy", "Seafood", etc.

#### 3. Producer Information

```javascript
producer: {
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
}
```

- **producer.name**: Name of manufacturer/farm
- **producer.address**: Can be:
  - Blockchain wallet address (e.g., `0x742d35Cc...`)
  - Physical address
  - Database User ID

**Example:**
```javascript
producer: {
  name: "ABC Organic Farm",
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

#### 4. IPFS Integration

```javascript
ipfsHash: {
  type: String,
  description: 'IPFS hash (CID) for images/certificates'
}

ipfsUrl: {
  type: String,
  description: 'Full IPFS gateway URL'
}
```

- **ipfsHash**: Content Identifier (CID) from IPFS
- **ipfsUrl**: Full gateway URL for direct access

**Example:**
```javascript
ipfsHash: "QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p",
ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmX7K8..."
```

#### 5. Blockchain Connection

```javascript
transactionHash: {
  type: String,
  description: 'Blockchain transaction hash'
}

blockchainAddress: {
  type: String,
  description: 'Smart contract address'
}
```

- Links product to blockchain for verification
- **transactionHash**: The tx hash when product was registered
- **blockchainAddress**: Smart contract address

#### 6. Product Status

```javascript
status: {
  type: String,
  enum: ['Pending', 'Produced', 'InTransit', 'Delivered'],
  default: 'Pending',
  required: true
}
```

**Status Flow:**
1. **Pending**: Initial state, product registered but not yet produced
2. **Produced**: Manufacturing complete, ready for shipment
3. **InTransit**: Being transported to distributor/retailer
4. **Delivered**: Arrived at final destination

#### 7. Supply Chain History

```javascript
history: [{
  actor: String,           // Who performed the action
  action: String,          // What action was taken
  timestamp: Date,         // When it happened
  location: String,        // Where it happened
  notes: String            // Additional details
}]
```

- **actor**: Person/company performing action (e.g., "ABC Farm", "XYZ Transport")
- **action**: Description of action (e.g., "Product manufactured", "Shipped", "Quality check")
- **timestamp**: Auto-filled with current date/time
- **location**: Physical location (e.g., "Da Lat, Vietnam")
- **notes**: Optional additional information

**Example:**
```javascript
history: [
  {
    actor: "ABC Organic Farm",
    action: "Product manufactured",
    timestamp: "2024-03-12T08:00:00.000Z",
    location: "Da Lat, Vietnam",
    notes: "Quality checked and packaged"
  },
  {
    actor: "FastShip Logistics",
    action: "Shipped to distributor",
    timestamp: "2024-03-13T14:30:00.000Z",
    location: "Ho Chi Minh City",
    notes: "Temperature controlled transport at 4°C"
  }
]
```

### Additional Fields

```javascript
qrCode: String              // QR code data for scanning
origin: String              // Origin location
batchNumber: String         // Production batch number
expiryDate: Date           // Expiry date (if applicable)
```

### Automatic Timestamps

```javascript
createdAt: Date    // Auto: When document was created
updatedAt: Date    // Auto: When document was last modified
```

These are automatically managed by Mongoose with `timestamps: true`.

## Schema Methods

### Instance Methods

#### `addHistoryEntry(actor, action, location, notes)`

Add a new entry to the product's history.

```javascript
const product = await Product.findOne({ productId: 'PROD-001' });

await product.addHistoryEntry(
  'XYZ Transport',
  'Shipped to distributor',
  'Ho Chi Minh City',
  'Temperature controlled'
);
```

#### `updateStatusWithHistory(newStatus, actor, location, notes)`

Update product status and automatically add a history entry.

```javascript
await product.updateStatusWithHistory(
  'Delivered',
  'Supermarket Manager',
  'District 1, HCMC',
  'Product received and verified'
);
```

### Static Methods

#### `Product.findByProducer(producerAddress)`

Find all products from a specific producer.

```javascript
const products = await Product.findByProducer('0x742d35Cc...');
```

#### `Product.findByStatus(status)`

Find all products with a specific status.

```javascript
const inTransitProducts = await Product.findByStatus('InTransit');
```

### Virtual Fields

#### `latestHistory`

Get the most recent history entry without querying.

```javascript
const product = await Product.findOne({ productId: 'PROD-001' });
console.log('Latest action:', product.latestHistory.action);
```

## Usage Examples

### 1. Create a New Product

```javascript
const Product = require('./models/Product.model');

const product = await Product.create({
  productId: 'PROD-2024-001',
  name: 'Organic Green Vegetables',
  description: 'Fresh organic vegetables grown without pesticides',
  category: 'Vegetables',
  producer: {
    name: 'ABC Organic Farm',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  },
  ipfsHash: 'QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p',
  ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmX7K8...',
  transactionHash: '0x123abc...',
  status: 'Produced',
  origin: 'Da Lat, Vietnam',
  batchNumber: 'BATCH-2024-Q1-001',
  history: [{
    actor: 'ABC Organic Farm',
    action: 'Product manufactured',
    timestamp: new Date(),
    location: 'Da Lat, Vietnam',
    notes: 'Quality checked and packaged'
  }]
});

console.log('Product created:', product.productId);
```

### 2. Track Product Journey

```javascript
// Step 1: Product manufactured
const product = await Product.create({
  productId: 'PROD-2024-002',
  name: 'Fresh Tomatoes',
  category: 'Vegetables',
  producer: {
    name: 'GreenLife Farm',
    address: '0xProducer123'
  },
  status: 'Produced',
  history: [{
    actor: 'GreenLife Farm',
    action: 'Harvested and packaged',
    timestamp: new Date(),
    location: 'Lam Dong Province',
    notes: 'Organic certification verified'
  }]
});

// Step 2: Shipped
await product.updateStatusWithHistory(
  'InTransit',
  'FastShip Logistics',
  'Da Nang Warehouse',
  'Temperature: 4°C'
);

// Step 3: Delivered
await product.updateStatusWithHistory(
  'Delivered',
  'CityMart Supermarket',
  'Hanoi',
  'Quality inspection passed'
);

// View complete history
product.history.forEach((entry, i) => {
  console.log(`Step ${i + 1}: ${entry.action} by ${entry.actor}`);
});
```

### 3. Find Products

```javascript
// By producer
const myProducts = await Product.findByProducer('0x742d35Cc...');

// By status
const deliveredProducts = await Product.findByStatus('Delivered');

// By category and status
const inTransitVeggies = await Product.find({
  category: 'Vegetables',
  status: 'InTransit'
});

// Recent products (last 7 days)
const recentProducts = await Product.find({
  createdAt: {
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
}).sort({ createdAt: -1 });

// Products with IPFS images
const productsWithImages = await Product.find({
  ipfsHash: { $exists: true, $ne: null }
});
```

### 4. Integration with IPFS

```javascript
const ipfsService = require('./services/ipfsService');
const fs = require('fs');

async function createProductWithImage(productData, imagePath) {
  // Upload image to IPFS
  const imageBuffer = fs.readFileSync(imagePath);
  const ipfsResult = await ipfsService.uploadToIPFS(
    imageBuffer,
    'product-image.jpg',
    { productId: productData.productId }
  );

  // Create product with IPFS data
  const product = await Product.create({
    ...productData,
    ipfsHash: ipfsResult.ipfsHash,
    ipfsUrl: ipfsResult.ipfsUrl,
    history: [{
      actor: productData.producer.name,
      action: 'Product created with image on IPFS',
      timestamp: new Date(),
      location: productData.origin,
      notes: `Image: ${ipfsResult.ipfsHash}`
    }]
  });

  return product;
}
```

### 5. Integration with Blockchain

```javascript
const blockchainService = require('./services/blockchainService');

async function registerProductOnBlockchain(productData) {
  // Register on blockchain first
  const txHash = await blockchainService.registerProduct(
    productData.name,
    productData.origin,
    productData.ipfsHash || ''
  );

  // Create in database with tx hash
  const product = await Product.create({
    ...productData,
    transactionHash: txHash,
    history: [{
      actor: 'System',
      action: 'Product registered on blockchain',
      timestamp: new Date(),
      location: 'Blockchain',
      notes: `Transaction: ${txHash}`
    }]
  });

  return product;
}
```

## API Controller Examples

### Create Product Endpoint

```javascript
// controllers/product.controller.js
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      category,
      producer,
      origin,
      batchNumber
    } = req.body;

    // Validate required fields
    if (!productId || !name || !category || !producer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create product
    const product = await Product.create({
      productId,
      name,
      description,
      category,
      producer,
      origin,
      batchNumber,
      status: 'Pending',
      history: [{
        actor: producer.name,
        action: 'Product registered in system',
        timestamp: new Date(),
        location: origin,
        notes: 'Awaiting production'
      }]
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### Update Product Status Endpoint

```javascript
exports.updateProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status, actor, location, notes } = req.body;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.updateStatusWithHistory(
      status,
      actor,
      location,
      notes
    );

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### Get Product History Endpoint

```javascript
exports.getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        productId: product.productId,
        name: product.name,
        status: product.status,
        producer: product.producer,
        history: product.history,
        ipfsUrl: product.ipfsUrl,
        transactionHash: product.transactionHash
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

## Database Indexes

The schema includes optimized indexes for common queries:

```javascript
productSchema.index({ productId: 1 });           // Unique lookup
productSchema.index({ 'producer.address': 1 });  // Find by producer
productSchema.index({ transactionHash: 1 });     // Blockchain verification
productSchema.index({ status: 1 });              // Filter by status
productSchema.index({ category: 1 });            // Filter by category
productSchema.index({ createdAt: -1 });          // Sort by date
```

These indexes ensure fast query performance even with millions of products.

## Validation Rules

### Required Fields
- `productId` - Must be unique
- `name` - Product name
- `category` - Product category
- `producer.name` - Producer name
- `producer.address` - Producer address
- `status` - Must be one of: Pending, Produced, InTransit, Delivered

### Optional Fields
- `description`, `ipfsHash`, `ipfsUrl`, `transactionHash`, `blockchainAddress`
- `qrCode`, `origin`, `batchNumber`, `expiryDate`

### Automatic Fields
- `createdAt` - Set on creation
- `updatedAt` - Updated automatically on save
- `history` - Initialized as empty array if not provided

## Best Practices

### 1. Always Add History When Updating Status

```javascript
// ❌ DON'T: Update status without history
product.status = 'Delivered';
await product.save();

// ✅ DO: Update status with history
await product.updateStatusWithHistory(
  'Delivered',
  'Retail Manager',
  'Store Location',
  'Quality verified'
);
```

### 2. Store IPFS Hash on Blockchain

```javascript
// Upload to IPFS → Get hash → Store on blockchain → Save to MongoDB
const ipfsHash = await uploadToIPFS(imageBuffer);
const txHash = await blockchainService.registerProduct(name, origin, ipfsHash);
await Product.create({ productId, ipfsHash, transactionHash: txHash });
```

### 3. Use Transactions for Critical Operations

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const product = await Product.create([productData], { session });
  // Other operations...
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 4. Validate Status Transitions

```javascript
const validTransitions = {
  'Pending': ['Produced'],
  'Produced': ['InTransit'],
  'InTransit': ['Delivered'],
  'Delivered': []
};

function canTransition(currentStatus, newStatus) {
  return validTransitions[currentStatus].includes(newStatus);
}
```

## Complete Workflow Example

```javascript
// 1. Producer creates product
const product = await Product.create({
  productId: 'PROD-2024-003',
  name: 'Organic Strawberries',
  category: 'Fruits',
  producer: {
    name: 'Berry Paradise Farm',
    address: '0xProducerABC'
  },
  status: 'Pending',
  origin: 'Da Lat',
  history: [{
    actor: 'Berry Paradise Farm',
    action: 'Product registered',
    timestamp: new Date(),
    location: 'Da Lat',
    notes: 'Awaiting harvest'
  }]
});

// 2. Upload image to IPFS
const imageBuffer = fs.readFileSync('strawberries.jpg');
const ipfsResult = await ipfsService.uploadToIPFS(imageBuffer, 'strawberries.jpg');
product.ipfsHash = ipfsResult.ipfsHash;
product.ipfsUrl = ipfsResult.ipfsUrl;
await product.save();

// 3. Register on blockchain
const txHash = await blockchainService.registerProduct(
  product.name,
  product.origin,
  product.ipfsHash
);
product.transactionHash = txHash;
await product.save();

// 4. Mark as produced
await product.updateStatusWithHistory(
  'Produced',
  'Berry Paradise Farm',
  'Da Lat',
  'Harvest complete, quality A+'
);

// 5. Ship to distributor
await product.updateStatusWithHistory(
  'InTransit',
  'CoolChain Logistics',
  'Highway to HCMC',
  'Refrigerated truck, temp 2°C'
);

// 6. Deliver to retail
await product.updateStatusWithHistory(
  'Delivered',
  'FreshMart Store',
  'District 1, HCMC',
  'Received and displayed'
);

// 7. View complete journey
console.log('Product Journey:');
product.history.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.action} by ${entry.actor} at ${entry.location}`);
});
```

---

## 🎯 Summary

The Product Model provides:
- ✅ Complete supply chain tracking from production to delivery
- ✅ IPFS integration for decentralized image storage
- ✅ Blockchain integration for immutable verification
- ✅ Detailed history tracking with actor, action, location, timestamp
- ✅ Flexible status management with automatic history
- ✅ Optimized database indexes for fast queries
- ✅ Built-in methods for common operations
- ✅ Automatic timestamp management

Perfect for Food Traceability Systems requiring transparency, security, and auditability! 🚀
