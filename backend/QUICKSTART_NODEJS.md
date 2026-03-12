# 🚀 Quick Start Guide - Node.js Backend

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/food-traceability
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
JWT_SECRET=your_random_secret_key
```

## Step 3: Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

## Step 4: Start Blockchain Node
```bash
# Using Ganache CLI
ganache-cli

# Or Hardhat
npx hardhat node
```

## Step 5: Deploy Smart Contract
```bash
# Deploy your FoodTraceability contract
# Get the contract address and update .env
```

## Step 6: Run the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Step 7: Test the API
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "MANUFACTURER"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📋 Checklist
- [ ] Node.js installed (v16+)
- [ ] MongoDB running
- [ ] Blockchain node running (Ganache/Hardhat)
- [ ] Smart contract deployed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Server started successfully

## 🔍 Troubleshooting

### Port already in use
```bash
# Change PORT in .env file
PORT=3001
```

### MongoDB connection error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or restart MongoDB
sudo systemctl restart mongod
```

### Blockchain connection error
```bash
# Verify RPC_URL in .env
# Make sure blockchain node is running
# Check PRIVATE_KEY is valid
```

## 🎯 Next Steps
1. Test all API endpoints
2. Deploy smart contract to testnet
3. Integrate with frontend
4. Implement additional features

## 📚 Resources
- Express.js: https://expressjs.com/
- Ethers.js: https://docs.ethers.org/
- MongoDB: https://www.mongodb.com/docs/
- Mongoose: https://mongoosejs.com/docs/
