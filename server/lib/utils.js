const ethers = require("ethers");
const { Contract } = require("@ethersproject/contracts");
const config = require("../../client/config");
const path = require("path");
const { execSync } = require("child_process");
const _ = require("lodash");

const contracts = {};

const utils = {
  sleep: async (millis) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => setTimeout(resolve, millis));
  },

  getContract(chainId, contractName) {
    chainId = chainId.toString();
    if (config.supportedId[chainId]) {
      if (!contracts[chainId]) {
        contracts[chainId] = {};
      }
      if (!contracts[chainId][contractName]) {
        let provider;
        if (chainId === "1337") {
          provider = new ethers.providers.JsonRpcProvider();
        } else {
          provider = new ethers.providers.InfuraProvider(
            chainId === "4" ? "rinkeby" : "homestead",
            process.env.INFURA_API_KEY
          );
        }
        contracts[chainId][contractName] = new Contract(
          config.address[chainId][contractName],
          config.abi[contractName],
          provider
        );
      }
      return contracts[chainId][contractName];
    }
    return false;
  },
};

module.exports = utils;
