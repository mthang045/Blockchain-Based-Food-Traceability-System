# Food Traceability System - Backend

A blockchain-based backend system for food traceability using Node.js, Express, and ethers.js.

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── blockchain.config.js   # Blockchain/ethers.js setup
│   └── database.config.js     # MongoDB connection
├── contracts/              # Smart contract ABIs
│   ├── FoodTraceability.json
│   └── README.md
├── controllers/            # Route controllers
│   ├── product.controller.js
│   ├── user.controller.js
│   └── blockchain.controller.js
├── middleware/             # Express middleware
│   └── auth.middleware.js
│   └── signature.middleware.js
│   └── txSigning.middleware.js
├── models/                 # Database models
│   ├── Product.model.js
│   └── User.model.js
├── routes/                 # API routes
│   ├── productRoutes.js
│   ├── userRoutes.js
│   └── blockchainRoutes.js
├── services/               # Business logic
│   ├── product.service.js
│   ├── user.service.js
│   └── blockchain.service.js
├── .env.example            # Environment variables template
├── package.json
└── server.js              # Main entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- A running Ethereum node (Ganache, Hardhat node, or testnet)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```env
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/food-traceability

# Blockchain
BLOCKCHAIN_NETWORK=localhost
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Products
- `GET /api/products` - Get all products
- `GET /api/products/batch/:batchNumber` - Get batch by batch number
- `GET /api/products/batch/:batchNumber/traceability/verify` - Verify batch traceability integrity
- `GET /api/products/:productId` - Get product by ID
- `GET /api/products/:productId/history` - Get product history from blockchain
- `GET /api/products/:productId/traceability/verify` - Verify product traceability integrity
- `POST /api/products` - Create new product (requires auth, role ADMIN/MANUFACTURER, user-signed tx)
- `POST /api/products/batches` - Create new batch explicitly (same security requirements)
- `POST /api/products/signature/challenge` - Get canonical message challenge to sign (requires auth)
- `PUT /api/products/:productId/status` - Update product status (requires auth, role-based, user-signed tx)

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)
- `GET /api/users` - Get all users (admin only)

### Blockchain
- `GET /api/blockchain/network` - Get blockchain network info
- `GET /api/blockchain/transaction/:txHash` - Get transaction details
- `GET /api/blockchain/verify/:productId` - Verify product on blockchain
- `GET /api/blockchain/logs` - Get all blockchain logs (requires auth)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## ✍️ User-Signed Transactions

For blockchain write endpoints, each user signs with their own wallet private key per request.

- Header (recommended): `x-user-private-key: 0x...`
- Fallback body field: `userPrivateKey`

Security notes:
- Private key is only used in-memory to sign the transaction.
- `userPrivateKey` is removed from request body before business logic continues.
- If profile has `walletAddress`, backend verifies it matches the provided private key.

### Request-Level Digital Signature (Anti-replay)

Protected blockchain-write routes now require request signature headers:

- `x-wallet-address`: Wallet used to sign the request message
- `x-signature`: Signature of canonical request message
- `x-signature-timestamp`: Unix epoch milliseconds
- `x-signature-nonce`: Random one-time nonce

Backend validates:

- Signature is cryptographically valid
- Signed wallet matches user profile wallet (if available)
- Nonce has not been reused
- Timestamp is fresh (5-minute window)

Canonical message format to sign:

```text
FoodTraceability Request Authorization
user:<userId>
wallet:<walletAddress>
action:<METHOD> <PATH>
timestamp:<timestamp>
nonce:<nonce>
```

Challenge endpoint request:

```http
POST /api/products/signature/challenge
Authorization: Bearer <jwt>
Content-Type: application/json

{
	"method": "POST",
	"path": "/api/products",
	"walletAddress": "0x..."
}
```

The backend returns `message`, `timestamp`, and `nonce` to be signed by MetaMask.

MetaMask frontend helper is available in [frontend/src/app/services/signatureService.js](../frontend/src/app/services/signatureService.js).
Client-side private key prompt/cache helper is available in [frontend/src/app/services/txSigningClient.js](../frontend/src/app/services/txSigningClient.js).

Example create batch request:

```http
POST /api/products
Authorization: Bearer <jwt>
x-wallet-address: 0x...
x-signature: 0x...
x-signature-timestamp: 1712040000000
x-signature-nonce: 3f4dcb44-4f26-4aaf-a05d-e4e73a2f42f1
x-user-private-key: 0x...
Content-Type: application/json

{
	"name": "Organic Rice",
	"origin": "Can Tho",
	"category": "FOOD",
	"batchNumber": "LOT-20260402-A1",
	"lotSize": 200,
	"unit": "kg",
	"description": "Batch 2026-04"
}
```

Example update status request:

```http
PUT /api/products/PROD-ABC123/status
Authorization: Bearer <jwt>
x-wallet-address: 0x...
x-signature: 0x...
x-signature-timestamp: 1712040005000
x-signature-nonce: 6845dc64-2e63-462f-9aef-8f4fc9b6fd4e
x-user-private-key: 0x...
Content-Type: application/json

{
	"status": "InTransit",
	"location": "Distribution Hub A",
	"notes": "Loaded onto truck"
}
```

## 🧭 Role Rules For On-Chain Actions

- Create product on-chain: `ADMIN`, `MANUFACTURER`
- Update status to `Produced`: `ADMIN`, `MANUFACTURER`
- Update status to `InTransit`: `ADMIN`, `TRANSPORTER`
- Update status to `Delivered`: `ADMIN`, `TRANSPORTER`, `STORE`
- Update status to `InStore`: `ADMIN`, `STORE`
- Update status to `Sold`: `ADMIN`, `STORE`

## 🏗️ Architecture

### MVC Pattern
- **Models**: Database schemas (MongoDB/Mongoose)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and blockchain interactions
- **Routes**: Define API endpoints

### Key Features
- ✅ RESTful API design
- ✅ JWT authentication & authorization
- ✅ Blockchain integration with ethers.js
- ✅ MongoDB database
- ✅ Error handling middleware
- ✅ CORS support
- ✅ Environment-based configuration

## 🔗 Blockchain Integration

The system integrates with Ethereum smart contracts using ethers.js:

1. **Configuration**: `config/blockchain.config.js`
2. **Services**: `services/blockchain.service.js`
3. **ABIs**: Store contract ABIs in `contracts/` folder

### Smart Contract Operations
- Register products on blockchain
- Update product status
- Retrieve product history
- Verify product authenticity

## 🗄️ Database Models

### Product Model
- Product ID, name, description
- Manufacturing details
- Blockchain transaction hash
- Current status
- QR code

### User Model
- Username, email, password (hashed)
- Role (ADMIN, MANUFACTURER, TRANSPORTER, STORE, CONSUMER)
- Wallet address
- Authentication methods

## 🛠️ Development

### Adding New Routes

1. Create controller in `controllers/`
2. Create service in `services/`
3. Define routes in `routes/`
4. Register routes in `server.js`

### Adding Smart Contract ABIs

1. Compile your Solidity contract
2. Extract the ABI
3. Create JSON file in `contracts/` folder
4. Use `loadContractABI()` in your service

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | - |
| RPC_URL | Blockchain RPC endpoint | http://127.0.0.1:8545 |
| PRIVATE_KEY | Optional server fallback signer (legacy mode) | - |
| CONTRACT_ADDRESS | Deployed contract address | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRES_IN | Token expiration time | 7d |

## 🧪 Testing

```bash
npm test
npm run test:api-security
npm run test:signature-traceability
npm run test:e2e-batch-signature
```

## 🔄 Data Migration To Batch Model

Run migration for existing product records:

```bash
npm run migrate:batch-model
```

Optional env for migration signing:

```env
MIGRATION_SIGNER_PRIVATE_KEY=0x...
```

If missing, script still migrates batch fields but skips regenerating traceability proofs.

## 📦 Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **ethers**: Ethereum library
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License
