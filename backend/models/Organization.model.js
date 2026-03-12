/**
 * Organization Model - Represents companies in the supply chain
 * (Manufacturers, Distributors, Stores, etc.)
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, required: true, default: 'Vietnam' }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String }
}, { _id: false });

const licenseSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true },
  licenseType: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  issuingAuthority: { type: String, required: true },
  isValid: { type: Boolean, default: true }
}, { _id: true });

const organizationSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['MANUFACTURER', 'FARM', 'PROCESSOR', 'DISTRIBUTOR', 'WAREHOUSE', 'RETAILER', 'RESTAURANT'],
      message: '{VALUE} is not a valid organization type'
    },
    required: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  contact: {
    type: contactSchema,
    required: true
  },
  licenses: {
    type: [licenseSchema],
    default: []
  },
  taxId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  certifications: [{
    name: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    certificateUrl: { type: String }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalProducts: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  // Associated users (employees)
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    website: String,
    logoUrl: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ type: 1, isActive: 1 });
organizationSchema.index({ 'address.city': 1 });
organizationSchema.index({ isVerified: 1 });
organizationSchema.index({ createdAt: -1 });

// Virtual: Full address string
organizationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}${addr.state ? ', ' + addr.state : ''}, ${addr.country}`;
});

// Virtual: Active licenses count
organizationSchema.virtual('activeLicensesCount').get(function() {
  return this.licenses.filter(l => l.isValid && l.expiryDate > new Date()).length;
});

// Virtual: Products associated with this organization
organizationSchema.virtual('products', {
  ref: 'Product',
  localField: 'walletAddress',
  foreignField: 'producer.address'
});

// Methods
organizationSchema.methods.addLicense = function(licenseData) {
  this.licenses.push(licenseData);
  return this.save();
};

organizationSchema.methods.addCertification = function(certData) {
  this.certifications.push(certData);
  return this.save();
};

organizationSchema.methods.incrementProductCount = function() {
  this.totalProducts += 1;
  return this.save();
};

organizationSchema.methods.incrementTransactionCount = function() {
  this.totalTransactions += 1;
  return this.save();
};

organizationSchema.methods.updateRating = function(newRating) {
  this.rating = newRating;
  return this.save();
};

// Statics
organizationSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

organizationSchema.statics.findVerified = function() {
  return this.find({ isVerified: true, isActive: true });
};

organizationSchema.statics.findByCity = function(city) {
  return this.find({ 'address.city': city, isActive: true });
};

organizationSchema.statics.findByWalletAddress = function(walletAddress) {
  return this.findOne({ walletAddress });
};

// Middleware
organizationSchema.pre('save', function(next) {
  // Check license validity
  if (this.licenses && this.licenses.length > 0) {
    this.licenses.forEach(license => {
      if (license.expiryDate < new Date()) {
        license.isValid = false;
      }
    });
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
