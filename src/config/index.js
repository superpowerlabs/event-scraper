const contracts = require("./deployedProduction.json");
const events = require("./events.json");
const ethers = require("ethers");

const conversion = { address: "string", uint256: "bigint" };

const config = {
  conversion,
  contracts,
  eventsConfig: events,
  providers: {
    1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
    56: new ethers.providers.JsonRpcProvider("https://bscrpc.com", 56),
  },
};

module.exports = config;
