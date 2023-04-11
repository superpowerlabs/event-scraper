const ethers = require("ethers");

const config = {
  typeMapping: {
    address: "VARCHAR(256)",
    uint256: "NUMERIC(78, 0)",
    bool: "BOOLEAN",
  },
  contracts: require("./deployedProduction.json"),
  eventsByContract: require("./eventsByContract"),
  providers: {
    1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
  },
};

module.exports = config;
