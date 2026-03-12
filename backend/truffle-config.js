require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Get mnemonic from environment variable
const mnemonic = process.env.MNEMONIC || '';

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. You can use truffle networks --help
   * for more information.
   */
  networks: {
    // Development network (Ganache GUI)
    development: {
      host: '127.0.0.1',     // Localhost
      port: 7545,            // Ganache GUI default port
      network_id: '*',       // Match any network id
      gas: 6721975,          // Gas limit
      gasPrice: 20000000000  // 20 gwei
    },

    // Ganache CLI (if needed)
    ganache: {
      host: '127.0.0.1',
      port: 8545,            // Ganache CLI default port
      network_id: '*',
      gas: 6721975,
      gasPrice: 20000000000
    },

    // Testnet configurations (commented out by default)
    // Uncomment and configure when deploying to testnets

    // Sepolia testnet (Ethereum)
    // sepolia: {
    //   provider: () => new HDWalletProvider(
    //     mnemonic,
    //     `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    //   ),
    //   network_id: 11155111,
    //   gas: 5500000,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true
    // },

    // Goerli testnet (Ethereum)
    // goerli: {
    //   provider: () => new HDWalletProvider(
    //     mnemonic,
    //     `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    //   ),
    //   network_id: 5,
    //   gas: 5500000,
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   skipDryRun: true
    // },

    // BSC Testnet
    // bscTestnet: {
    //   provider: () => new HDWalletProvider(
    //     mnemonic,
    //     `https://data-seed-prebsc-1-s1.binance.org:8545`
    //   ),
    //   network_id: 97,
    //   confirmations: 10,
    //   timeoutBlocks: 200,
    //   skipDryRun: true
    // }
  },

  /**
   * Compiler configuration
   */
  compilers: {
    solc: {
      version: '0.8.20',      // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,      // Enable optimization
          runs: 200           // Optimize for how many times you intend to run the code
        },
        evmVersion: 'paris'   // EVM version (paris for post-merge Ethereum)
      }
    }
  },

  /**
   * Truffle DB is currently disabled by default; to enable it, change enabled:
   * false to enabled: true. The default storage location can also be
   * overridden by specifying the adapter settings, as shown in the commented code below.
   */
  db: {
    enabled: false
  },

  /**
   * Console configuration
   */
  console: {
    require: [],
    env: {
      url: 'http://127.0.0.1:7545'
    }
  },

  /**
   * Contract directory and build directory
   */
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',

  /**
   * Migrations directory
   */
  migrations_directory: './migrations',

  /**
   * Configure your plugins
   */
  plugins: [
    // 'truffle-plugin-verify'  // Uncomment to verify contracts on Etherscan
  ],

  // Plugin configuration for Etherscan verification
  // api_keys: {
  //   etherscan: process.env.ETHERSCAN_API_KEY,
  //   bscscan: process.env.BSCSCAN_API_KEY
  // }
};
