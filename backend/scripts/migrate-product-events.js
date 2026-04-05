/*
  Backfill Transaction and QRCode collections from existing Product documents.
  This keeps legacy product-centric data while creating normalized event records.
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('../models/Product.model');
const Transaction = require('../models/Transaction.model');
const QRCode = require('../models/QRCode.model');
const connectDatabase = require('../config/database.config');

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const STATUS_MAP = {
  PENDING: 'Pending',
  PRODUCED: 'Produced',
  MANUFACTURED: 'Produced',
  INTRANSIT: 'InTransit',
  IN_TRANSIT: 'InTransit',
  DELIVERED: 'Delivered',
  INSTORE: 'InStore',
  IN_STORE: 'InStore',
  SOLD: 'Sold'
};

const STATUS_TO_TRANSACTION_TYPE = {
  Produced: 'PRODUCTION',
  InTransit: 'TRANSFER',
  Delivered: 'TRANSFER',
  InStore: 'STORAGE',
  Sold: 'SALE',
  Pending: 'STORAGE'
};

const STATUS_TO_TRANSACTION_STATUS = {
  Produced: 'COMPLETED',
  InTransit: 'IN_TRANSIT',
  Delivered: 'COMPLETED',
  InStore: 'COMPLETED',
  Sold: 'COMPLETED',
  Pending: 'PENDING'
};

const normalizeStatus = (status = 'Pending') => {
  const lookupKey = String(status || 'Pending')
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();

  return STATUS_MAP[lookupKey] || status || 'Pending';
};

const extractStatusFromAction = (action, fallbackStatus) => {
  const match = action?.match(/Status changed to (.+)$/);
  return normalizeStatus(match?.[1] || fallbackStatus || 'Pending');
};

const toObjectIdIfValid = (value) => {
  if (!value) {
    return undefined;
  }

  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : undefined;
};

const buildLocationSnapshot = (locationValue) => {
  const safeLocation = locationValue || 'Unknown location';
  return {
    name: safeLocation,
    address: safeLocation
  };
};

const buildPartySnapshot = (party, role) => ({
  organizationId: toObjectIdIfValid(party?.userId),
  name: party?.name || `${role} party`,
  walletAddress: party?.walletAddress || party?.address || 'N/A',
  role
});

const resolvePartiesByStatus = (product, status) => {
  const related = product.relatedParties || {};
  const manufacturer = related.manufacturer || {
    userId: product.producer?.userId,
    name: product.producer?.name,
    walletAddress: product.producer?.address
  };
  const transporter = related.transporter || {
    userId: null,
    name: 'Transporter',
    walletAddress: 'N/A'
  };
  const store = related.store || {
    userId: null,
    name: 'Store',
    walletAddress: 'N/A'
  };
  const consumer = related.consumer || {
    userId: null,
    name: 'Consumer',
    walletAddress: 'N/A'
  };

  if (status === 'Produced') {
    return {
      from: buildPartySnapshot(manufacturer, 'SENDER'),
      to: buildPartySnapshot(manufacturer, 'RECEIVER')
    };
  }

  if (status === 'InTransit') {
    return {
      from: buildPartySnapshot(manufacturer, 'SENDER'),
      to: buildPartySnapshot(transporter, 'RECEIVER'),
      transporter: buildPartySnapshot(transporter, 'TRANSPORTER')
    };
  }

  if (status === 'Delivered') {
    return {
      from: buildPartySnapshot(transporter, 'SENDER'),
      to: buildPartySnapshot(store, 'RECEIVER'),
      transporter: buildPartySnapshot(transporter, 'TRANSPORTER')
    };
  }

  if (status === 'InStore') {
    return {
      from: buildPartySnapshot(store, 'SENDER'),
      to: buildPartySnapshot(store, 'RECEIVER')
    };
  }

  if (status === 'Sold') {
    return {
      from: buildPartySnapshot(store, 'SENDER'),
      to: buildPartySnapshot(consumer, 'RECEIVER')
    };
  }

  return {
    from: buildPartySnapshot(manufacturer, 'SENDER'),
    to: buildPartySnapshot(manufacturer, 'RECEIVER')
  };
};

const ensureQRCodeRecord = async (product) => {
  const qrCodeId = `QR-${product.productId}`;
  const qrData = product.qrCode || `FOODCHAIN-${product.productId}`;

  await QRCode.findOneAndUpdate(
    { productId: product.productId },
    {
      $set: {
        qrCodeId,
        product: product._id,
        productId: product.productId,
        qrData,
        verificationUrl: `${FRONTEND_BASE_URL}/trace/${product.productId}`,
        generatedBy: {
          userId: toObjectIdIfValid(product.producer?.userId),
          organizationId: toObjectIdIfValid(product.producer?.userId)
        },
        metadata: {
          batchNumber: product.batchNumber || '',
          notes: product.description || ''
        }
      },
      $setOnInsert: {
        format: 'PNG',
        size: 300,
        isActive: true,
        isVerified: false,
        totalScans: 0,
        uniqueScans: 0
      }
    },
    { upsert: true }
  );
};

const upsertTransactionEvent = async (product, entry, index) => {
  const status = extractStatusFromAction(entry.action, product.status);
  const txType = STATUS_TO_TRANSACTION_TYPE[status] || 'STORAGE';
  const txStatus = STATUS_TO_TRANSACTION_STATUS[status] || 'PENDING';
  const parties = resolvePartiesByStatus(product, status);
  const txTimestamp = entry.timestamp ? new Date(entry.timestamp) : new Date();
  const txId = `TXN-${product.productId}-${String(status).toUpperCase()}-${txTimestamp.getTime()}-${index}`;

  const payload = {
    transactionId: txId,
    product: product._id,
    productId: product.productId,
    type: txType,
    from: parties.from,
    to: parties.to,
    quantity: {
      amount: Number(product.lotSize || 1),
      unit: product.unit || 'unit'
    },
    origin: buildLocationSnapshot(product.origin || entry.location),
    destination: buildLocationSnapshot(entry.location || product.origin),
    status: txStatus,
    blockchainTxHash: product.transactionHash || undefined,
    notes: entry.notes || entry.action || `Status changed to ${status} by ${entry.actor || 'System'}`
  };

  if (parties.transporter) {
    payload.transporter = parties.transporter;
  }

  if (txStatus === 'COMPLETED') {
    payload.completedAt = txTimestamp;
  }

  await Transaction.findOneAndUpdate(
    { transactionId: txId },
    { $set: payload },
    { upsert: true }
  );
};

const migrate = async () => {
  const summary = {
    products: 0,
    qrcodesUpserted: 0,
    transactionsUpserted: 0,
    errors: 0
  };

  try {
    await connectDatabase();

    const products = await Product.find().lean();
    summary.products = products.length;

    for (const product of products) {
      try {
        await ensureQRCodeRecord(product);
        summary.qrcodesUpserted += 1;

        const history = Array.isArray(product.history) && product.history.length > 0
          ? product.history
          : [{
              actor: product.producer?.name || 'System',
              action: `Status changed to ${normalizeStatus(product.status || 'Pending')}`,
              timestamp: product.createdAt || new Date(),
              location: product.origin || 'Unknown location',
              notes: product.description || 'Backfilled from product snapshot'
            }];

        for (let idx = 0; idx < history.length; idx += 1) {
          await upsertTransactionEvent(product, history[idx], idx);
          summary.transactionsUpserted += 1;
        }
      } catch (productError) {
        summary.errors += 1;
        console.warn(`Failed to migrate product ${product.productId}:`, productError.message);
      }
    }

    console.log('Migration completed:', summary);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrate();
