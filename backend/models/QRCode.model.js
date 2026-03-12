/**
 * QRCode Model - Tracks QR code generation and scanning history
 * For product authentication and traceability
 */

const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  scannedAt: { type: Date, required: true, default: Date.now },
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String
  }
}, { _id: true });

const qrCodeSchema = new mongoose.Schema({
  qrCodeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  productId: {
    type: String,
    required: true,
    index: true
  },
  qrData: {
    type: String,
    required: true,
    trim: true
  },
  qrImageUrl: {
    type: String,
    trim: true
  },
  qrImageBase64: {
    type: String
  },
  format: {
    type: String,
    enum: ['PNG', 'SVG', 'JPEG', 'PDF'],
    default: 'PNG'
  },
  size: {
    type: Number,
    default: 300
  },
  verificationUrl: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date,
    index: true
  },
  generatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
  },
  scanHistory: {
    type: [scanHistorySchema],
    default: []
  },
  totalScans: {
    type: Number,
    default: 0,
    index: true
  },
  uniqueScans: {
    type: Number,
    default: 0
  },
  lastScannedAt: {
    type: Date,
    index: true
  },
  metadata: {
    batchNumber: String,
    printedOn: Date,
    printBatch: String,
    notes: String
  },
  securityFeatures: {
    encryptionType: { type: String, default: 'AES-256' },
    signature: String,
    checksum: String,
    secretKey: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
qrCodeSchema.index({ productId: 1, isActive: 1 });
qrCodeSchema.index({ isActive: 1, expiryDate: 1 });
qrCodeSchema.index({ totalScans: -1 });
qrCodeSchema.index({ createdAt: -1 });

// Virtual: Is expired
qrCodeSchema.virtual('isExpired').get(function() {
  if (this.expiryDate) {
    return new Date() > this.expiryDate;
  }
  return false;
});

// Virtual: Days until expiry
qrCodeSchema.virtual('daysUntilExpiry').get(function() {
  if (this.expiryDate) {
    const diff = this.expiryDate - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual: Average scans per day
qrCodeSchema.virtual('averageScansPerDay').get(function() {
  const daysSinceCreation = Math.ceil((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
  return daysSinceCreation > 0 ? (this.totalScans / daysSinceCreation).toFixed(2) : 0;
});

// Methods
qrCodeSchema.methods.recordScan = function(scanData) {
  // Add to scan history
  this.scanHistory.push({
    scannedAt: new Date(),
    location: scanData.location || {},
    device: scanData.device || {},
    scannedBy: scanData.scannedBy || {}
  });
  
  // Update scan counts
  this.totalScans += 1;
  this.lastScannedAt = new Date();
  
  // Calculate unique scans (simplified - based on unique IPs)
  if (scanData.device?.ip) {
    const uniqueIps = new Set(
      this.scanHistory
        .filter(s => s.device?.ip)
        .map(s => s.device.ip)
    );
    this.uniqueScans = uniqueIps.size;
  }
  
  return this.save();
};

qrCodeSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

qrCodeSchema.methods.activate = function() {
  this.isActive = true;
  return this.save();
};

qrCodeSchema.methods.verify = function() {
  this.isVerified = true;
  return this.save();
};

qrCodeSchema.methods.extendExpiry = function(days) {
  if (!this.expiryDate) {
    this.expiryDate = new Date();
  }
  this.expiryDate.setDate(this.expiryDate.getDate() + days);
  return this.save();
};

qrCodeSchema.methods.getScanStatistics = function() {
  return {
    totalScans: this.totalScans,
    uniqueScans: this.uniqueScans,
    lastScannedAt: this.lastScannedAt,
    averageScansPerDay: this.averageScansPerDay,
    scanHistory: this.scanHistory.slice(-10) // Last 10 scans
  };
};

// Statics
qrCodeSchema.statics.findByProduct = function(productId) {
  return this.find({ productId }).sort({ createdAt: -1 });
};

qrCodeSchema.statics.findActive = function() {
  return this.find({
    isActive: true,
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ]
  });
};

qrCodeSchema.statics.findExpired = function() {
  return this.find({
    expiryDate: { $lte: new Date() }
  });
};

qrCodeSchema.statics.findMostScanned = function(limit = 10) {
  return this.find().sort({ totalScans: -1 }).limit(limit);
};

qrCodeSchema.statics.findRecentlyScanned = function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({
    lastScannedAt: { $gte: date }
  }).sort({ lastScannedAt: -1 });
};

qrCodeSchema.statics.getGlobalStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalQRCodes: { $sum: 1 },
        activeQRCodes: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalScans: { $sum: '$totalScans' },
        totalUniqueScans: { $sum: '$uniqueScans' },
        verifiedQRCodes: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        averageScansPerCode: { $avg: '$totalScans' }
      }
    }
  ]);
  
  return stats[0] || {
    totalQRCodes: 0,
    activeQRCodes: 0,
    totalScans: 0,
    totalUniqueScans: 0,
    verifiedQRCodes: 0,
    averageScansPerCode: 0
  };
};

// Middleware
qrCodeSchema.pre('save', function(next) {
  // Generate qrCodeId if not exists
  if (!this.qrCodeId) {
    this.qrCodeId = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Auto-deactivate if expired
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isActive = false;
  }
  
  next();
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
