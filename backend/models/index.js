/**
 * Database Models Index
 * Central export point for all Mongoose models
 */

const User = require('./User.model');
const Product = require('./Product.model');
const Organization = require('./Organization.model');
const Transaction = require('./Transaction.model');
const BlockchainLog = require('./BlockchainLog.model');
const QRCode = require('./QRCode.model');

module.exports = {
  User,
  Product,
  Organization,
  Transaction,
  BlockchainLog,
  QRCode
};
