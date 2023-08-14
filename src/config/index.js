const ethers = require("ethers");
const path = require("path");
const fs = require("fs-extra");

let contracts = require("./deployedProduction.json");
let eventsByContract = require("./eventsByContract");

let providers = {
  1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
  5: new ethers.providers.InfuraProvider("goerli", process.env.INFURA_KEY),
  137: new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/"),
  56: new ethers.providers.JsonRpcProvider("https://bscrpc.com", 56),
  7001: new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/zetachain_evm_testnet", 7001),
};

let averageBlockPerDay = {
  1: 240,
  56: 1200,
  137: 1800,
};

if (process.env.NODE_ENV !== "test") {
  // checks if there are overrides
  const configOverridePath = path.join(__dirname, "../../config-override.js");
  if (fs.existsSync(configOverridePath)) {
    const configOverride = require(configOverridePath);
    contracts = configOverride.contracts;
    eventsByContract = configOverride.eventsByContract;
    providers = { ...providers, ...(configOverride.providers || {}) };
    averageBlockPerDay = {
      ...averageBlockPerDay,
      ...(configOverride.averageBlockPerDay || {}),
    };
  }
}

const supportedByMoralis = {
  1: "Ethereum Mainnet",
  25: "Cronos Mainnet",
  56: "Binance Smart Chain Mainnet",
  97: "Binance Smart Chain Testnet",
  137: "Polygon Mainnet",
  250: "Fantom",
  42161: "Arbitrum",
  43114: "Avalanche C-Chain",
  80001: "Polygon Mumbai",
  11155111: "Ethereum Sepolia",
  11297108109: "Palm",
};

const config = {
  typeMapping: {
    address: "VARCHAR(256)",
    uint256: "NUMERIC(78, 0)",
    bool: "BOOLEAN",
  },
  contracts,
  eventsByContract,
  providers,
  averageBlockPerDay,
  supportedByMoralis,
};

module.exports = config;
