const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDatabase = require('../config/database.config');

dotenv.config();

const run = async () => {
  try {
    await connectDatabase();

    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const collection = db.collection('blockchainlogs');

    const count = await collection.countDocuments();
    const latest = await collection
      .find({}, { projection: { _id: 0, transactionHash: 1, blockNumber: 1, functionName: 1 } })
      .sort({ blockNumber: -1 })
      .limit(3)
      .toArray();

    let allDatabases = [];
    try {
      const admin = db.admin();
      const dbs = await admin.listDatabases();
      allDatabases = (dbs.databases || []).map((item) => item.name);
    } catch (e) {
      allDatabases = ['N/A'];
    }

    console.log('DB_NAME=', dbName);
    console.log('BLOCKCHAINLOGS_COUNT=', count);
    console.log('LATEST_3=', latest);
    console.log('AVAILABLE_DATABASES=', allDatabases.join(','));
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
