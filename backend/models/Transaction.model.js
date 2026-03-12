/**
 * Transaction Model - Represents supply chain transactions
 * Tracks product movements between organizations
 */

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { _id: false });

const partySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  walletAddress: { type: String, required: true },
  role: {
    type: String,
    enum: ['SENDER', 'RECEIVER', 'TRANSPORTER'],
    required: true
  }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'invoice', 'certificate', 'shipment_note', etc.
  url: { type: String, required: true }, // IPFS hash or URL
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const transactionSchema = new mongoose.Schema({
  transactionId: {
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
  type: {
    type: String,
    enum: {
      values: ['PRODUCTION', 'TRANSFER', 'STORAGE', 'SALE', 'RETURN', 'DISPOSAL'],
      message: '{VALUE} is not a valid transaction type'
    },
    required: true,
    index: true
  },
  from: {
    type: partySchema,
    required: true
  },
  to: {
    type: partySchema,
    required: true
  },
  transporter: {
    type: partySchema,
    required: false
  },
  quantity: {
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: 'kg' }
  },
  price: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'VND' }
  },
  origin: {
    type: locationSchema,
    required: true
  },
  destination: {
    type: locationSchema,
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'FAILED'],
      message: '{VALUE} is not a valid status'
    },
    default: 'PENDING',
    required: true,
    index: true
  },
  blockchainTxHash: {
    type: String,
    trim: true,
    index: true
  },
  blockNumber: {
    type: Number
  },
  gasUsed: {
    type: String
  },
  documents: {
    type: [documentSchema],
    default: []
  },
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
    temperature: {
      min: Number,
      max: Number,
      current: Number,
      unit: { type: String, default: '°C' }
    },
    humidity: {
      value: Number,
      unit: { type: String, default: '%' }
    },
    notes: String
  },
  notes: {
    type: String,
    trim: true
  },
  verifiedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ productId: 1, createdAt: -1 });
transactionSchema.index({ 'from.organizationId': 1 });
transactionSchema.index({ 'to.organizationId': 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ blockchainTxHash: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual: Duration
transactionSchema.virtual('duration').get(function() {
  if (this.shipmentDetails?.departureTime && this.shipmentDetails?.arrivalTime) {
    const duration = this.shipmentDetails.arrivalTime - this.shipmentDetails.departureTime;
    return Math.floor(duration / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Virtual: Is delayed
transactionSchema.virtual('isDelayed').get(function() {
  if (this.shipmentDetails?.estimatedArrival && this.status === 'IN_TRANSIT') {
    return new Date() > this.shipmentDetails.estimatedArrival;
  }
  return false;
});

// Methods
transactionSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'COMPLETED') {
    this.completedAt = new Date();
    if (this.shipmentDetails) {
      this.shipmentDetails.arrivalTime = new Date();
    }
  }
  return this.save();
};

transactionSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

transactionSchema.methods.updateConditions = function(conditionsData) {
  this.conditions = { ...this.conditions, ...conditionsData };
  return this.save();
};

transactionSchema.methods.verify = function() {
  this.verifiedAt = new Date();
  return this.save();
};

transactionSchema.methods.setBlockchainData = function(txHash, blockNumber, gasUsed) {
  this.blockchainTxHash = txHash;
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  return this.save();
};

// Statics
transactionSchema.statics.findByProduct = function(productId) {
  return this.find({ productId }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByOrganization = function(orgId) {
  return this.find({
    $or: [
      { 'from.organizationId': orgId },
      { 'to.organizationId': orgId }
    ]
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

transactionSchema.statics.findPending = function() {
  return this.find({ status: { $in: ['PENDING', 'IN_TRANSIT'] } }).sort({ createdAt: -1 });
};

transactionSchema.statics.findCompleted = function(startDate, endDate) {
  const query = { status: 'COMPLETED' };
  if (startDate) query.completedAt = { $gte: startDate };
  if (endDate) query.completedAt = { ...query.completedAt, $lte: endDate };
  return this.find(query).sort({ completedAt: -1 });
};

// Middleware
transactionSchema.pre('save', function(next) {
  // Generate transactionId if not exists
  if (!this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
