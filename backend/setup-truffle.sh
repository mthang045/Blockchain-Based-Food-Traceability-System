#!/bin/bash

# Truffle Quick Setup Script for Food Traceability System
# This script helps you set up Truffle with Ganache GUI

echo "🔧 Truffle + Ganache Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Ganache mnemonic."
    echo ""
    echo "📝 Steps to get your mnemonic from Ganache:"
    echo "   1. Open Ganache GUI"
    echo "   2. Click QUICKSTART or create a NEW WORKSPACE"
    echo "   3. Click the key icon (🔑) at the top right"
    echo "   4. Copy the 12-word mnemonic"
    echo "   5. Paste it into .env file (MNEMONIC=your words here)"
    echo ""
    read -p "Press Enter to continue after updating .env..."
else
    echo "✅ .env file exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Truffle is installed
if ! command -v truffle &> /dev/null; then
    echo "⚠️  Truffle not found globally. Using local installation..."
    TRUFFLE="npx truffle"
else
    echo "✅ Truffle found"
    TRUFFLE="truffle"
fi

# Compile contracts
echo ""
echo "🔨 Compiling smart contracts..."
$TRUFFLE compile

if [ $? -eq 0 ]; then
    echo "✅ Contracts compiled successfully"
else
    echo "❌ Compilation failed. Please check your contracts for errors."
    exit 1
fi

# Check if Ganache is running
echo ""
echo "🔍 Checking if Ganache is running on port 7545..."
if nc -z 127.0.0.1 7545 2>/dev/null; then
    echo "✅ Ganache is running"
    
    # Deploy contracts
    echo ""
    echo "🚀 Deploying contracts to Ganache..."
    $TRUFFLE migrate --network development
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Contracts deployed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Check contract-address.json for deployed address"
        echo "   2. Update CONTRACT_ADDRESS in .env file"
        echo "   3. Test blockchain integration: npm run test:blockchain"
        echo ""
        echo "🎉 Setup complete! You're ready to develop!"
    else
        echo "❌ Deployment failed. Check the error messages above."
        exit 1
    fi
else
    echo "❌ Ganache is not running on port 7545"
    echo ""
    echo "⚠️  Please start Ganache GUI before deploying:"
    echo "   1. Open Ganache application"
    echo "   2. Click QUICKSTART or create a workspace"
    echo "   3. Verify it's running on port 7545 (Settings → Server)"
    echo "   4. Run this script again"
    exit 1
fi
