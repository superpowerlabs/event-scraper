const ethers = require("ethers");
const path = require("path");
const fs = require("fs-extra");

let contracts = require("./deployedProduction.json");
let eventsByContract = require("./eventsByContract");

let providers = {
  1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
  56: new ethers.providers.JsonRpcProvider("https://bscrpc.com", 56),
};

let averageBlockPerDay = {
  1: 240,
  56: 1200,
  137: 1800,
};

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
};

module.exports = config;
