# 🔧 Truffle Configuration Guide

## Overview

This guide explains how to use **Truffle** with **Ganache GUI** to compile, deploy, and test your Food Traceability smart contracts.

## Prerequisites

### 1. Install Ganache GUI

Download and install Ganache GUI:
- **Download**: https://trufflesuite.com/ganache/
- **Windows**: Download `.exe` installer
- **Mac**: Download `.dmg` file
- **Linux**: Download `.AppImage`

### 2. Install Truffle Dependencies

```bash
cd backend
npm install
```

This will install:
- `truffle` - Smart contract development framework
- `@truffle/hdwallet-provider` - HD Wallet provider for deployments

## Ganache GUI Setup

### 1. Launch Ganache

1. Open Ganache GUI application
2. Click **"QUICKSTART"** for a new workspace
3. Or click **"NEW WORKSPACE"** to create a custom workspace

### 2. Configure Ganache (Optional)

Go to **Settings (⚙️)** → **Server**:

- ✅ **Hostname**: 127.0.0.1
- ✅ **Port Number**: 7545
- ✅ **Network ID**: 5777 (or any)
- ✅ **Automine**: ON (transactions mined instantly)

Click **"SAVE AND RESTART"**

### 3. Get Your Mnemonic

In Ganache GUI:
1. Go to **Accounts** tab
2. Click on the **key icon (🔑)** at the top right
3. Copy the **12-word mnemonic phrase**
4. Save it securely!

**Example mnemonic:**
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```env
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your mnemonic:

```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=development
RPC_URL=http://127.0.0.1:7545
MNEMONIC=candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
```

⚠️ **Important**: 
- Never commit `.env` to Git
- Keep your mnemonic secure
- Use different mnemonics for development and production

## Truffle Configuration

The `truffle-config.js` file has been configured with:

### ✅ Development Network (Ganache GUI)
```javascript
development: {
  host: '127.0.0.1',
  port: 7545,
  network_id: '*',
  gas: 6721975,
  gasPrice: 20000000000
}
```

### ✅ Solidity Compiler (v0.8.20)
```javascript
compilers: {
  solc: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
```

### ✅ Secure Mnemonic
```javascript
const mnemonic = process.env.MNEMONIC || '';
```

## Usage

### 1. Compile Smart Contracts

```bash
npm run truffle:compile
```

Or:
```bash
truffle compile
```

This will:
- Compile all `.sol` files in `contracts/` folder
- Generate ABI and bytecode in `build/contracts/`
- Create JSON files for each contract

**Expected Output:**
```
Compiling your contracts...
===========================
> Compiling ./contracts/FoodTraceability.sol
> Compiling ./contracts/Migrations.sol

> Compilation warnings encountered:

> Artifacts written to /backend/build/contracts
> Compiled successfully using:
   - solc: 0.8.20+commit.a1b79de6.Emscripten.clang
```

### 2. Migrate (Deploy) Contracts

**Make sure Ganache is running!**

```bash
npm run truffle:migrate
```

Or:
```bash
truffle migrate --network development
```

This will:
- Deploy `Migrations.sol` contract
- Deploy `FoodTraceability.sol` contract
- Save contract address to `contract-address.json`

**Expected Output:**
```
Starting migrations...
======================
> Network name:    'development'
> Network id:      5777
> Block gas limit: 6721975 (0x6691b7)

1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x123abc...
   > Blocks: 0            Seconds: 0
   > contract address:    0xABC123...
   > block number:        1
   > block timestamp:     1234567890
   > account:             0x742d35Cc...
   > balance:             99.99
   > gas used:            245462 (0x3bf26)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00490924 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00490924 ETH

2_deploy_food_traceability.js
==============================

   Deploying 'FoodTraceability'
   -----------------------------
   > transaction hash:    0x456def...
   > Blocks: 0            Seconds: 0
   > contract address:    0xDEF456...
   > block number:        3
   > block timestamp:     1234567892
   > account:             0x742d35Cc...
   > balance:             99.97
   > gas used:            1523456 (0x173e60)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.03046912 ETH

   Saving artifacts...
   -------------------------------------
   > Total cost:          0.03046912 ETH

Summary
=======
> Total deployments:   2
> Final cost:          0.03537836 ETH
```

### 3. Update Backend with Contract Address

After deployment, update your `.env`:

```env
CONTRACT_ADDRESS=0xDEF456...  # Use the address from migration output
```

Or use the auto-generated `contract-address.json`:

```json
{
  "network": "development",
  "address": "0xDEF456...",
  "deployedAt": "2024-03-12T10:30:00.000Z"
}
```

### 4. Test Contracts

```bash
npm run truffle:test
```

Or:
```bash
truffle test
```

### 5. Truffle Console (Interactive)

```bash
npm run truffle:console
```

Or:
```bash
truffle console --network development
```

**In the console:**

```javascript
// Get contract instance
let instance = await FoodTraceability.deployed()

// Call functions
await instance.registerProduct("PROD-001", "Organic Vegetables", "Da Lat")

// Get product info
let product = await instance.getProductById("PROD-001")
console.log(product)

// Get accounts
let accounts = await web3.eth.getAccounts()
console.log(accounts[0])

// Check balance
let balance = await web3.eth.getBalance(accounts[0])
console.log(web3.utils.fromWei(balance, 'ether'))
```

## Common Commands

### Compile Only (No Deploy)
```bash
truffle compile
```

### Reset and Redeploy
```bash
truffle migrate --reset --network development
```

### Run Specific Migration
```bash
truffle migrate -f 2 --network development
```

### Compile with Verbose Output
```bash
truffle compile --all
```

## Project Structure

```
backend/
├── contracts/                 # Solidity smart contracts
│   ├── FoodTraceability.sol  # Main contract
│   └── Migrations.sol        # Truffle migrations contract
├── migrations/               # Deployment scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_food_traceability.js
├── build/                    # Compiled contracts (auto-generated)
│   └── contracts/
│       ├── FoodTraceability.json
│       └── Migrations.json
├── truffle-config.js         # Truffle configuration
├── contract-address.json     # Deployed contract address (auto-generated)
└── .env                      # Environment variables (DO NOT COMMIT)
```

## Integration with Backend

### Update blockchainService.js

After deploying, update your blockchain service to use the deployed contract:

```javascript
// backend/services/blockchainService.js
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Read contract address from deployment
const contractData = JSON.parse(
  fs.readFileSync('./contract-address.json', 'utf8')
);

// Read ABI from compiled contract
const contractArtifact = JSON.parse(
  fs.readFileSync('./build/contracts/FoodTraceability.json', 'utf8')
);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  contractData.address,
  contractArtifact.abi,
  wallet
);

// Use the contract
async function registerProduct(productId, name, origin) {
  const tx = await contract.registerProduct(productId, name, origin);
  await tx.wait();
  return tx.hash;
}

module.exports = { contract, registerProduct };
```

## Troubleshooting

### Error: Could not connect to your Ethereum client

**Solution:**
- Make sure Ganache GUI is running
- Check port is 7545 in both Ganache and `truffle-config.js`
- Verify RPC URL: http://127.0.0.1:7545

### Error: Exceeds block gas limit

**Solution:**
```javascript
// In truffle-config.js, increase gas limit
development: {
  gas: 8000000  // Increase this
}
```

Or in Ganache:
- Settings → Server → Gas Limit → Increase to 8000000

### Error: Out of Gas

**Solution:**
```javascript
// When calling contract functions
await contract.myFunction({
  gasLimit: 500000  // Specify higher gas limit
})
```

### Error: Network not found

**Solution:**
```bash
# Use correct network name
truffle migrate --network development  # Not 'localhost'
```

### Error: Invalid mnemonic

**Solution:**
- Make sure MNEMONIC in `.env` has 12 words
- Use single line (no line breaks)
- Copy directly from Ganache GUI

## Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```
.env
contract-address.json
build/
```

### 2. Use Different Accounts

- **Development**: Use Ganache test accounts
- **Testnet**: Create new mnemonic for testnets
- **Mainnet**: Use hardware wallet (Ledger/Trezor)

### 3. Verify Deployments

After deploying:
1. Check contract address in Ganache GUI (Transactions tab)
2. Verify contract state using Truffle console
3. Test contract functions before using in production

## Next Steps

1. ✅ Configure Ganache GUI (port 7545)
2. ✅ Copy mnemonic to `.env`
3. ✅ Install dependencies: `npm install`
4. ✅ Compile contracts: `npm run truffle:compile`
5. ✅ Deploy contracts: `npm run truffle:migrate`
6. ✅ Update `CONTRACT_ADDRESS` in `.env`
7. ✅ Test blockchain integration: `npm run test:blockchain`

## Resources

- **Truffle Docs**: https://trufflesuite.com/docs/truffle/
- **Ganache Docs**: https://trufflesuite.com/docs/ganache/
- **Solidity Docs**: https://docs.soliditylang.org/
- **Web3.js Docs**: https://web3js.readthedocs.io/

---

**🎉 You're ready to develop with Truffle + Ganache!**
