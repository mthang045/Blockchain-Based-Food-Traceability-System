require('dotenv').config();

const connectDatabase = require('./config/database.config');
const Product = require('./models/Product.model');
const { createTraceabilityProof } = require('./utils/traceabilityProof');
const { ethers } = require('ethers');

const generateBatchNumber = () => `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();

const getSignerPrivateKey = () => {
  const migrationKey = process.env.MIGRATION_SIGNER_PRIVATE_KEY;
  if (migrationKey && migrationKey.trim()) {
    return migrationKey.trim();
  }

  const fallback = process.env.PRIVATE_KEY;
  if (fallback && fallback !== 'your_private_key_here') {
    return fallback.trim();
  }

  const mnemonic = process.env.MNEMONIC;
  if (mnemonic && mnemonic !== 'your_12_word_mnemonic_phrase_here') {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      return wallet.privateKey;
    } catch (error) {
      console.warn('⚠️ Failed to derive private key from MNEMONIC:', error.message);
    }
  }

  return null;
};

const migrateProductsToBatchModel = async () => {
  await connectDatabase();

  const signerPrivateKey = getSignerPrivateKey();
  if (!signerPrivateKey) {
    console.warn('⚠️ No signing private key configured. Set MIGRATION_SIGNER_PRIVATE_KEY (preferred) or PRIVATE_KEY to generate traceability proofs.');
  }

  const cursor = Product.find().cursor();
  let updatedCount = 0;

  for await (const product of cursor) {
    let hasChanges = false;

    if (!product.entityType) {
      product.entityType = 'BATCH';
      hasChanges = true;
    }

    if (!product.batchNumber) {
      product.batchNumber = generateBatchNumber();
      hasChanges = true;
    }

    if (!product.lotSize || Number(product.lotSize) < 1) {
      product.lotSize = 1;
      hasChanges = true;
    }

    if (!product.unit) {
      product.unit = 'unit';
      hasChanges = true;
    }

    if (signerPrivateKey) {
      product.traceabilityProof = await createTraceabilityProof(product, signerPrivateKey);
      hasChanges = true;
    }

    if (hasChanges) {
      await product.save();
      updatedCount += 1;
      console.log(`✅ Migrated: ${product.productId} -> ${product.batchNumber}`);
    }
  }

  console.log(`\n🎉 Migration completed. Updated ${updatedCount} records.`);
};

migrateProductsToBatchModel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  });
