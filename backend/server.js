require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database.config');
const { initializeBlockchain } = require('./services/initBlockchain');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Food Traceability API', version: '1.0.0' });
});

// Error handlers
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ MongoDB connected\n');

    // Initialize Blockchain Service
    console.log('⛓️  Initializing Blockchain Service...');
    const blockchainResult = await initializeBlockchain();
    
    if (blockchainResult.success) {
      console.log('✅ Blockchain service ready\n');
    } else {
      console.warn('⚠️  Blockchain service initialization failed:', blockchainResult.error);
      console.warn('⚠️  Server will start but blockchain features may not work\n');
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log('━'.repeat(60));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API endpoints: http://localhost:${PORT}/api`);
      console.log('━'.repeat(60));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
