const contracts = require("./deployedProduction.json");
const abi = require("./ABIs.json").contracts;
const events = require("./events.json");
const ethers = require("ethers");

const config = {
  contracts,
  geckoApi:
    "https://api.coingecko.com/api/v3/simple/price?ids=syndicate-2&vs_currencies=usd&include_24hr_change=true",
  abi,
  tokenTypes: {
    S_SYNR_SWAP: 1,
    SYNR_STAKE: 2,
    SYNR_PASS_STAKE_FOR_BOOST: 3,
    SYNR_PASS_STAKE_FOR_SEEDS: 4,
    BLUEPRINT_STAKE_FOR_BOOST: 5,
    BLUEPRINT_STAKE_FOR_SEEDS: 6,
    SEED_SWAP: 7,
  },
  eventsConfig: events,
  providers: {
    1: new ethers.providers.InfuraProvider("homestead", process.env.INFURA_KEY),
    56: new ethers.providers.JsonRpcProvider("https://bscrpc.com", 56),
  },
};

module.exports = config;
