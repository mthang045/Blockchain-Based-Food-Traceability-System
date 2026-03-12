/**
 * BlockchainLog Model - Caches blockchain events and transactions locally
 * Provides faster queries and backup of blockchain data
 */

const mongoose = require('mongoose');

const eventDataSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  parameters: { type: Map, of: mongoose.Schema.Types.Mixed },
  logIndex: { type: Number }
}, { _id: false });

const blockchainLogSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  blockNumber: {
    type: Number,
    required: true,
    index: true
  },
  blockHash: {
    type: String,
    required: true,
    trim: true
  },
  contractAddress: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  from: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  to: {
    type: String,
    trim: true,
    index: true
  },
  gasUsed: {
    type: String,
    required: true
  },
  gasPrice: {
    type: String
  },
  value: {
    type: String,
    default: '0'
  },
  functionName: {
    type: String,
    required: true,
    index: true
  },
  functionParams: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  events: {
    type: [eventDataSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS',
    required: true,
    index: true
  },
  errorMessage: {
    type: String
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['PRODUCT', 'TRANSACTION', 'ORGANIZATION', 'USER', 'OTHER'],
      required: true,
      index: true
    },
    entityId: {
      type: String,
      required: true,
      index: true
    },
    entityRef: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.entityType'
    }
  },
  blockTimestamp: {
    type: Date,
    required: true,
    index: true
  },
  confirmations: {
    type: Number,
    default: 0
  },
  network: {
    type: String,
    enum: ['development', 'testnet', 'mainnet'],
    required: true,
    default: 'development',
    index: true
  },
  chainId: {
    type: Number,
    required: true
  },
  metadata: {
    ipfsHash: String,
    productName: String,
    action: String,
    notes: String
  },
  isSynced: {
    type: Boolean,
    default: true
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
blockchainLogSchema.index({ blockNumber: -1, blockTimestamp: -1 });
blockchainLogSchema.index({ functionName: 1, status: 1 });
blockchainLogSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });
blockchainLogSchema.index({ from: 1, createdAt: -1 });
blockchainLogSchema.index({ network: 1, status: 1 });
blockchainLogSchema.index({ createdAt: -1 });

// Virtual: Transaction URL (e.g., etherscan)
blockchainLogSchema.virtual('explorerUrl').get(function() {
  const baseUrls = {
    mainnet: 'https://etherscan.io/tx/',
    testnet: 'https://sepolia.etherscan.io/tx/',
    development: `http://localhost:7545/tx/`
  };
  return `${baseUrls[this.network] || ''}${this.transactionHash}`;
});

// Virtual: Gas cost in ETH
blockchainLogSchema.virtual('gasCostEth').get(function() {
  if (this.gasUsed && this.gasPrice) {
    const gasUsed = BigInt(this.gasUsed);
    const gasPrice = BigInt(this.gasPrice);
    const costWei = gasUsed * gasPrice;
    return (Number(costWei) / 1e18).toFixed(6);
  }
  return '0';
});

// Virtual: Time since transaction
blockchainLogSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.blockTimestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Recently';
});

// Methods
blockchainLogSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  return this.save();
};

blockchainLogSchema.methods.updateConfirmations = function(confirmations) {
  this.confirmations = confirmations;
  return this.save();
};

blockchainLogSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'FAILED';
  this.errorMessage = errorMessage;
  return this.save();
};

blockchainLogSchema.methods.sync = function() {
  this.isSynced = true;
  this.lastSyncedAt = new Date();
  return this.save();
};

// Statics
blockchainLogSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'relatedEntity.entityType': entityType,
    'relatedEntity.entityId': entityId
  }).sort({ blockTimestamp: -1 });
};

blockchainLogSchema.statics.findByFunction = function(functionName) {
  return this.find({ functionName }).sort({ blockTimestamp: -1 });
};

blockchainLogSchema.statics.findByWallet = function(walletAddress) {
  return this.find({
    $or: [{ from: walletAddress }, { to: walletAddress }]
  }).sort({ blockTimestamp: -1 });
};

blockchainLogSchema.statics.findByBlockRange = function(startBlock, endBlock) {
  return this.find({
    blockNumber: { $gte: startBlock, $lte: endBlock }
  }).sort({ blockNumber: 1 });
};

blockchainLogSchema.statics.findRecent = function(limit = 50) {
  return this.find().sort({ blockTimestamp: -1 }).limit(limit);
};

blockchainLogSchema.statics.findFailed = function() {
  return this.find({ status: 'FAILED' }).sort({ blockTimestamp: -1 });
};

blockchainLogSchema.statics.getStatistics = async function(network = 'development') {
  const stats = await this.aggregate([
    { $match: { network } },
    {
      $group: {
        _id: '$functionName',
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] }
        },
        totalGasUsed: { $sum: { $toLong: '$gasUsed' } }
      }
    },
    {
      $project: {
        functionName: '$_id',
        count: 1,
        successCount: 1,
        failedCount: 1,
        totalGasUsed: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successCount', '$count'] },
            100
          ]
        }
      }
    }
  ]);
  
  return stats;
};

// Middleware
blockchainLogSchema.pre('save', function(next) {
  // Ensure blockTimestamp is set
  if (!this.blockTimestamp) {
    this.blockTimestamp = new Date();
  }
  next();
});

module.exports = mongoose.model('BlockchainLog', blockchainLogSchema);
