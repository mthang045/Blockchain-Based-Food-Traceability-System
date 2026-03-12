# Smart Contract ABIs

This folder contains the ABI (Application Binary Interface) files for the blockchain smart contracts used in the Food Traceability System.

## How to use

1. Place your compiled smart contract ABI JSON files in this folder
2. The naming convention should match the contract name (e.g., `FoodTraceability.json`)
3. The blockchain configuration will automatically load these ABIs when needed

## Example Structure

```json
{
  "contractName": "FoodTraceability",
  "abi": [
    // ABI array here
  ]
}
```

## Getting ABI from compiled contracts

If you're using Hardhat or Truffle to compile your Solidity contracts:

### Hardhat
After compilation, find the ABI in:
`artifacts/contracts/YourContract.sol/YourContract.json`

### Truffle
After compilation, find the ABI in:
`build/contracts/YourContract.json`

Copy the ABI array and create a JSON file in this folder.
