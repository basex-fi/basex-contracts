import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
const dotenv = require("dotenv");
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.4.18",
      },
    ],
  },
  defaultNetwork: "testnet",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    testnet: {
      url: "https://base-sepolia-rpc.publicnode.com",
      timeout: 200000000,
      gasPrice: 5100000000,
      gas: 5100000,
      accounts: [process.env.TESTER_PRIVATEKEY as string],
    },
    mainnet: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATEKEY as string],
    },
    merlin: {
      url: "https://rpc.merlinchain.io",
      accounts: [process.env.PRIVATEKEY as string],
    },
    optopia: {
      url: 'https://rpc-mainnet.optopia.ai',
      accounts: [process.env.PRIVATEKEY as string],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      testnet: process.env.APIKEY,
      mainnet: process.env.APIKEY,
      merlin: process.env.APIKEY,
      optopia: process.env.APIKEY,
    } as any,
    customChains: [
      {
        network: "testnet",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "merlin",
        chainId: 4200,
        urls: {
          apiURL: "https://scan.merlinchain.io/api",
          browserURL: "https://scan.merlinchain.io",
        },
      },
      {
        network: 'optopia',
        chainId: 62050,
        urls: {
          apiURL: 'https://scan.optopia.ai/api',
          browserURL: 'https://scan.optopia.ai',
        },
      },
    ],
  },
};

export default config;
