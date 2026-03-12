# 📦 IPFS Service - Pinata Integration

## 🎯 Overview

IPFS Service cho phép upload và lưu trữ product images, metadata, và documents lên **IPFS** (InterPlanetary File System) thông qua **Pinata** - một pinning service đáng tin cậy.

### Tại sao dùng IPFS?

- ✅ **Decentralized Storage** - Không phụ thuộc vào 1 server trung tâm
- ✅ **Content Addressing** - File được identify bằng hash (CID), không thể thay đổi
- ✅ **Permanent Storage** - Data được pin sẽ luôn available
- ✅ **Blockchain Compatible** - IPFS hash có thể lưu trên blockchain
- ✅ **Cost Effective** - Rẻhơn cloud storage

### Tại sao dùng Pinata?

- ✅ **Easy to Use** - Simple REST API
- ✅ **Reliable** - 99.9% uptime
- ✅ **Fast** - Global CDN với dedicated gateways
- ✅ **Free Tier** - 1GB storage + 100GB bandwidth/month miễn phí
- ✅ **Management** - Dashboard để quản lý files

## 🚀 Setup

### 1. Tạo Pinata Account

1. Truy cập: https://pinata.cloud
2. Click **"Sign Up"** → Đăng ký free account
3. Xác nhận email

### 2. Lấy API Keys

1. Đăng nhập Pinata
2. Vào **API Keys** (menu bên trái)
3. Click **"New Key"**
4. Chọn permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
   - ✅ `unpin`
   - ✅ `pinList`
5. Đặt tên (vd: "Food Traceability Backend")
6. Click **"Create Key"**
7. **Copy ngay** API Key và API Secret (chỉ hiện 1 lần!)

### 3. Cấu hình .env

Thêm vào file `.env` trong thư mục `backend/`:

```env
# IPFS Configuration (Pinata)
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_API_KEY=your_secret_api_key_here
```

**Ví dụ:**
```env
PINATA_API_KEY=e8f5d9c7a2b4f1e3
PINATA_SECRET_API_KEY=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
```

### 4. Cài đặt Dependencies

```bash
cd backend
npm install axios form-data
```

## 📝 API Usage

### Upload Image to IPFS

```javascript
const ipfsService = require('./services/ipfsService');
const fs = require('fs');

// Read image file
const imageBuffer = fs.readFileSync('product-image.jpg');

// Upload to IPFS
const result = await ipfsService.uploadToIPFS(
  imageBuffer, 
  'product-image.jpg',
  {
    productId: 'PROD-001',
    category: 'vegetables'
  }
);

console.log('IPFS Hash:', result.ipfsHash);
console.log('IPFS URL:', result.ipfsUrl);
// Output:
// IPFS Hash: QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p
// IPFS URL: https://gateway.pinata.cloud/ipfs/QmX7K8...
```

### Upload JSON Metadata

```javascript
const productMetadata = {
  productId: 'PROD-001',
  name: 'Organic Green Vegetables',
  origin: 'Da Lat, Vietnam',
  manufacturer: 'ABC Farm',
  certifications: ['Organic', 'VietGAP'],
  images: ['QmX7K8..', 'QmY8L9..']
};

const result = await ipfsService.uploadJSONToIPFS(
  productMetadata,
  'product-001-metadata.json'
);

console.log('IPFS Hash:', result.ipfsHash);
```

### Retrieve File from IPFS

```javascript
const ipfsHash = 'QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p';

const fileBuffer = await ipfsService.retrieveFromIPFS(ipfsHash);

// Save to disk
fs.writeFileSync('downloaded-image.jpg', fileBuffer);
```

### Check if File is Pinned

```javascript
const result = await ipfsService.checkPinStatus(ipfsHash);

if (result.isPinned) {
  console.log('File is pinned!');
  console.log('Name:', result.name);
  console.log('Size:', result.size);
}
```

### Unpin File (Delete)

```javascript
await ipfsService.unpinFromIPFS(ipfsHash);
console.log('File unpinned from Pinata');
```

## 🎨 Integration with Product Creation

### Example: Upload Product with Image

```javascript
// controllers/product.controller.js
const ipfsService = require('../services/ipfsService');
const multer = require('multer');

// Setup multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const createProductWithImage = async (req, res) => {
  try {
    const { name, origin, manufacturer } = req.body;
    const imageFile = req.file; // from multer

    // 1. Upload image to IPFS
    let imageIpfsHash = null;
    let imageUrl = null;

    if (imageFile) {
      const uploadResult = await ipfsService.uploadToIPFS(
        imageFile.buffer,
        imageFile.originalname,
        {
          productName: name,
          uploadedBy: manufacturer
        }
      );

      imageIpfsHash = uploadResult.ipfsHash;
      imageUrl = uploadResult.ipfsUrl;
    }

    // 2. Create product metadata
    const productMetadata = {
      name,
      origin,
      manufacturer,
      image: imageIpfsHash,
      createdAt: new Date().toISOString()
    };

    // 3. Upload metadata to IPFS
    const metadataResult = await ipfsService.uploadJSONToIPFS(
      productMetadata,
      `product-${Date.now()}-metadata.json`
    );

    // 4. Save to MongoDB
    const product = await Product.create({
      name,
      origin,
      manufacturer,
      imageIpfsHash: imageIpfsHash,
      imageUrl: imageUrl,
      metadataIpfsHash: metadataResult.ipfsHash,
      metadataUrl: metadataResult.ipfsUrl
    });

    // 5. Register on blockchain (use metadata IPFS hash)
    const txHash = await blockchainService.registerProduct(
      name,
      origin,
      metadataResult.ipfsHash // Store metadata hash on blockchain
    );

    product.blockchainTxHash = txHash;
    await product.save();

    res.status(201).json({
      success: true,
      data: {
        product,
        ipfs: {
          image: imageUrl,
          metadata: metadataResult.ipfsUrl
        },
        blockchain: {
          txHash: txHash
        }
      }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Route with multer middleware
router.post('/products', 
  authenticate, 
  upload.single('image'), 
  createProductWithImage
);
```

## 🧪 Testing

### Run Test Suite

```bash
npm run test:ipfs
```

**Test Cases:**
1. ✅ Test Pinata connection
2. ✅ Upload text file
3. ✅ Upload JSON metadata
4. ✅ Retrieve file from IPFS
5. ✅ Check pin status
6. ✅ Upload image

### Manual Testing

```bash
# Test connection
node -e "require('./services/ipfsService').testPinataConnection().then(console.log)"

# Upload file
node -e "const fs=require('fs'); const ipfs=require('./services/ipfsService'); const buf=fs.readFileSync('test.jpg'); ipfs.uploadToIPFS(buf,'test.jpg').then(console.log)"
```

## 📊 IPFS URLs & Gateways

Sau khi upload, file có thể truy cập qua nhiều gateways:

```
IPFS Hash: QmX7K8JfY9mZnP3rT2wV5bU4cD1aE6fG8hI2jK3lM4nO5p

Pinata Gateway (fastest):
https://gateway.pinata.cloud/ipfs/QmX7K8...

Public Gateways:
https://ipfs.io/ipfs/QmX7K8...
https://cloudflare-ipfs.com/ipfs/QmX7K8...
https://dweb.link/ipfs/QmX7K8...
```

## 🔒 Security Best Practices

### 1. Protect API Keys

```javascript
// ❌ DON'T: Hardcode credentials
const apiKey = 'e8f5d9c7a2b4f1e3';

// ✅ DO: Use environment variables
const apiKey = process.env.PINATA_API_KEY;
```

### 2. Validate File Types

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
```

### 3. Limit File Sizes

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (fileBuffer.length > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

### 4. Sanitize Filenames

```javascript
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};
```

## 💰 Pinata Pricing

### Free Tier
- ✅ 1 GB storage
- ✅ 100 GB bandwidth/month
- ✅ Unlimited pins
- ✅ Basic support

### Paid Plans (nếu cần scale)
- **Picnic** ($20/month): 100 GB storage
- **Fiesta** ($100/month): 1 TB storage
- **Custom**: Enterprise solutions

→ Free tier đủ cho development và small production

## 🐛 Troubleshooting

### Error: "Invalid Pinata API credentials"

**Solution:**
- Check API keys trong `.env`
- Đảm bảo không có space trước/sau keys
- Regenerate keys trên Pinata dashboard

### Error: "Pinata rate limit exceeded"

**Solution:**
- Free tier: 3 requests/second
- Đợi 1-2 giây giữa các requests
- Hoặc upgrade plan

### Error: "File too large"

**Solution:**
- Free tier: Max 100MB/file
- Compress images trước khi upload
- Hoặc resize images

### Slow upload speed

**Solution:**
- Check internet connection
- Compress file trước khi upload
- Use Pinata dedicated gateway (paid)

## 📚 Resources

- **Pinata Docs:** https://docs.pinata.cloud/
- **IPFS Docs:** https://docs.ipfs.tech/
- **Pinata Dashboard:** https://app.pinata.cloud/
- **IPFS Explorer:** https://explore.ipld.io/

## 🎯 Best Practices

### 1. Store IPFS Hash on Blockchain

```javascript
// ✅ Store metadata IPFS hash on blockchain
const metadataHash = 'QmX7K8...';
await contract.registerProduct(name, origin, metadataHash);

// Metadata JSON chứa:
{
  "name": "Product Name",
  "images": ["QmImage1...", "QmImage2..."],
  "description": "...",
  "certificates": ["QmCert1..."]
}
```

### 2. Use Descriptive Filenames

```javascript
// ❌ BAD
const filename = 'image.jpg';

// ✅ GOOD
const filename = `product-${productId}-main-image-${timestamp}.jpg`;
```

### 3. Add Metadata

```javascript
await ipfsService.uploadToIPFS(buffer, filename, {
  productId: 'PROD-001',
  productName: 'Organic Vegetables',
  uploadedBy: 'ABC Farm',
  uploadedAt: new Date().toISOString(),
  category: 'vegetables'
});
```

### 4. Cache IPFS URLs

```javascript
// Save IPFS URLs to MongoDB for quick access
const product = await Product.create({
  name: 'Product',
  imageIpfsHash: 'QmX7K8...',
  imageUrl: 'https://gateway.pinata.cloud/ipfs/QmX7K8...'
  // ↑ Cache để không cần resolve mỗi lần
});
```

## 🔄 Migration from CentralizedStorage

Nếu đã có images trên server, migrate sang IPFS:

```javascript
const fs = require('fs');
const path = require('path');

async function migrateImagesToIPFS() {
  const products = await Product.find({ imageIpfsHash: null });

  for (const product of products) {
    if (product.imagePath) {
      // Read old image
      const imageBuffer = fs.readFileSync(product.imagePath);
      const filename = path.basename(product.imagePath);

      // Upload to IPFS
      const result = await ipfsService.uploadToIPFS(
        imageBuffer,
        filename,
        { productId: product.productId }
      );

      // Update product
      product.imageIpfsHash = result.ipfsHash;
      product.imageUrl = result.ipfsUrl;
      await product.save();

      console.log(`✅ Migrated: ${product.productId}`);
    }
  }
}
```

---

**🎉 IPFS Service Ready!** Giờ bạn có thể upload product images lên IPFS và store hash trên blockchain để đảm bảo tính minh bạch và không thể thay đổi!
