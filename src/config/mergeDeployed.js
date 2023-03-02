const contracts = require("./deployed.json");
const deployedProduction = require("./deployedProduction.json");

for (let chainId in deployedProduction) {
  if (!contracts[chainId]) {
    contracts[chainId] = deployedProduction[chainId];
  } else {
    contracts[chainId] = Object.assign(
      contracts[chainId],
      deployedProduction[chainId]
    );
  }
}

module.exports = contracts;
