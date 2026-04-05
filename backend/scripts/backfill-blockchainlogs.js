/*
  Backfill historical on-chain events into blockchainlogs collection.
  Safe to re-run because records are upserted by transactionHash.
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDatabase = require('../config/database.config');
const BlockchainLog = require('../models/BlockchainLog.model');
const { getProvider, getContractReadOnly } = require('../config/blockchain.config');

const serializeBlockchainValue = (value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeBlockchainValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => Number.isNaN(Number(key)))
        .map(([key, item]) => [key, serializeBlockchainValue(item)])
    );
  }

  return value;
};

const mapReceiptStatus = (receiptStatus) => (receiptStatus === 0 ? 'FAILED' : 'SUCCESS');

const eventToFunctionName = (eventName) => {
  if (eventName === 'ProductRegistered') {
    return 'registerProduct';
  }

  if (eventName === 'ProductStatusUpdated') {
    return 'updateProductStatus';
  }

  return eventName;
};

const extractNamedEventArgs = (event) => {
  const args = event?.args;
  if (!args) {
    return {};
  }

  const namedFromArgs = Object.fromEntries(
    Object.entries(args)
      .filter(([key]) => Number.isNaN(Number(key)))
      .map(([key, value]) => [key, value])
  );

  if (Object.keys(namedFromArgs).length > 0) {
    return namedFromArgs;
  }

  const inputs = event?.fragment?.inputs || [];
  const fallback = {};
  for (let index = 0; index < inputs.length; index += 1) {
    const inputName = inputs[index]?.name || `arg${index}`;
    fallback[inputName] = args[index];
  }

  return fallback;
};

const extractRelatedEntity = (eventName, eventArgs = {}) => {
  const entityId = eventArgs.productId || eventArgs.batchId || eventArgs.id || 'unknown-entity';

  return {
    entityType: 'PRODUCT',
    entityId: String(entityId)
  };
};

const persistEventAsLog = async ({ provider, networkName, chainId, event }) => {
  const txHash = event.transactionHash;
  if (!txHash) {
    return false;
  }

  const [tx, receipt, block] = await Promise.all([
    provider.getTransaction(txHash),
    provider.getTransactionReceipt(txHash),
    provider.getBlock(event.blockNumber)
  ]);

  if (!receipt) {
    return false;
  }

  const functionParams = serializeBlockchainValue(extractNamedEventArgs(event));
  const relatedEntity = extractRelatedEntity(event.fragment?.name, functionParams);

  await BlockchainLog.findOneAndUpdate(
    { transactionHash: txHash },
    {
      $set: {
        transactionHash: txHash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        contractAddress: receipt.to || tx?.to || process.env.CONTRACT_ADDRESS,
        from: tx?.from || 'unknown',
        to: tx?.to || null,
        gasUsed: receipt.gasUsed?.toString() || '0',
        gasPrice: (receipt.effectiveGasPrice || tx?.gasPrice || 0n).toString(),
        value: tx?.value?.toString() || '0',
        functionName: eventToFunctionName(event.fragment?.name || 'unknown'),
        functionParams,
        events: [
          {
            eventName: event.fragment?.name || 'unknown',
            parameters: functionParams,
            logIndex: event.index
          }
        ],
        status: mapReceiptStatus(receipt.status),
        relatedEntity,
        blockTimestamp: block?.timestamp
          ? new Date(Number(block.timestamp) * 1000)
          : new Date(),
        confirmations: 0,
        network: networkName,
        chainId,
        isSynced: true,
        lastSyncedAt: new Date()
      }
    },
    { upsert: true }
  );

  return true;
};

const main = async () => {
  const summary = {
    latestBlock: 0,
    scannedEvents: 0,
    upsertedLogs: 0,
    failedEvents: 0
  };

  try {
    if (!process.env.CONTRACT_ADDRESS) {
      throw new Error('CONTRACT_ADDRESS is required in environment variables');
    }

    await connectDatabase();

    const provider = getProvider();
    const network = await provider.getNetwork();
    const networkName = process.env.BLOCKCHAIN_NETWORK || 'development';
    const chainId = Number(network.chainId);

    const contract = getContractReadOnly('FoodTraceability', process.env.CONTRACT_ADDRESS);
    const latestBlock = await provider.getBlockNumber();
    summary.latestBlock = latestBlock;

    const [productRegisteredEvents, productStatusUpdatedEvents] = await Promise.all([
      contract.queryFilter(contract.filters.ProductRegistered(), 0, latestBlock),
      contract.queryFilter(contract.filters.ProductStatusUpdated(), 0, latestBlock)
    ]);

    const events = [...productRegisteredEvents, ...productStatusUpdatedEvents].sort(
      (a, b) => a.blockNumber - b.blockNumber
    );

    summary.scannedEvents = events.length;

    for (const event of events) {
      try {
        const inserted = await persistEventAsLog({ provider, networkName, chainId, event });
        if (inserted) {
          summary.upsertedLogs += 1;
        }
      } catch (eventError) {
        summary.failedEvents += 1;
        console.warn(
          `Failed to backfill tx ${event.transactionHash || 'unknown-hash'}: ${eventError.message}`
        );
      }
    }

    console.log('Backfill completed:', summary);
  } catch (error) {
    console.error('Backfill failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

main();
