const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema({
  actor: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  location: { type: String, required: true },
  notes: String
}, { _id: true });

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  producer: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true }
  },
  ipfsHash: { type: String, trim: true },
  ipfsUrl: { type: String, trim: true },
  transactionHash: { type: String, trim: true, index: true },
  blockchainAddress: { type: String, trim: true },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Produced', 'InTransit', 'Delivered'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending',
    required: true
  },
  history: { type: [historyEntrySchema], default: [] },
  qrCode: String,
  origin: { type: String, trim: true },
  batchNumber: { type: String, trim: true },
  expiryDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ productId: 1 });
productSchema.index({ 'producer.address': 1 });
productSchema.index({ transactionHash: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

// Virtual: Latest history entry
productSchema.virtual('latestHistory').get(function() {
  return this.history?.length > 0 ? this.history[this.history.length - 1] : null;
});

// Methods
productSchema.methods.addHistoryEntry = function(actor, action, location, notes = '') {
  this.history.push({ actor, action, timestamp: new Date(), location, notes });
  return this.save();
};

productSchema.methods.updateStatusWithHistory = function(newStatus, actor, location, notes = '') {
  this.status = newStatus;
  this.history.push({
    actor,
    action: `Status changed to ${newStatus}`,
    timestamp: new Date(),
    location,
    notes
  });
  return this.save();
};

// Statics
productSchema.statics.findByProducer = function(producerAddress) {
  return this.find({ 'producer.address': producerAddress });
};

productSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Middleware
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);
