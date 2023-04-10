const contracts = require("./deployedProduction.json");
const events = require("./events.js");
const ethers = require("ethers");

const mapping = { address: "string", uint256: "bigint", bool: "boolean" };

const config = {
  mapping,
  contracts,
  eventsConfig: events,
  providers: {
    1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
    56: new ethers.providers.JsonRpcProvider("https://bscrpc.com", 56),
  },
};

module.exports = config;
