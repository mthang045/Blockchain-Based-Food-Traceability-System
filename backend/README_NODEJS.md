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
- `GET /api/products/:productId` - Get product by ID
- `GET /api/products/:productId/history` - Get product history from blockchain
- `POST /api/products` - Create new product (requires auth)
- `PUT /api/products/:productId/status` - Update product status (requires auth)

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
| PRIVATE_KEY | Wallet private key | - |
| CONTRACT_ADDRESS | Deployed contract address | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRES_IN | Token expiration time | 7d |

## 🧪 Testing

```bash
npm test
```

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
