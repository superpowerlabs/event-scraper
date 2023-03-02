const { supportedId, contracts, abi } = require("../config/index");
const { equal } = require("../utils/Address");
const ethers = require("ethers");
const _ = require("lodash");

function getContract(req, contractName, asset, chainId = 0) {
  const { provider, network } = getNetwork(req, chainId);
  let address;
  if (asset && !contractName) {
    const ownerOfAbi = [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "ownerOf",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ];
    return new ethers.Contract(asset, ownerOfAbi, provider);
  } else {
    address = contracts[network][contractName];
    if (address) {
      return new ethers.Contract(address, abi[contractName], provider);
    }
  }
}

function getUrl(chainId) {
  return supportedId[chainId]?.rpcUrls[0];
}

function getNetwork(req, chainId = 0) {
  let network;
  if (chainId === 0) {
    network =
      process.env.NODE_ENV === "test" ? 1337 : Number(req.get("Chain-id"));
  } else {
    network = chainId;
  }
  let provider;
  if (network < 6) {
    provider = new ethers.providers.InfuraProvider(
      network,
      process.env.INFURA_KEY
    );
  } else if (network === 1337) {
    provider = new ethers.providers.JsonRpcProvider();
  } else {
    provider = new ethers.providers.JsonRpcProvider(getUrl(network), network);
  }
  return { network, provider };
}

function timestamp(date = new Date()) {
  return parseInt((date.getTime() / 1000).toString());
}

function resError(res, error = "Unsupported network") {
  res.json({
    success: false,
    error,
  });
}

function bigNumberify(obj) {
  const isObject = (o) => {
    return typeof o === "object" && o !== null && !!Object.keys(o).length;
  };
  const manage = (item, i) => {
    if (isObject(item[i])) {
      if (item[i].type === "BigNumber" && item[i].hex) {
        item[i] = ethers.BigNumber.from(item[i].hex);
      } else {
        item[i] = bigNumberify(item[i]);
      }
    }
  };
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      try {
        manage(obj, i);
      } catch (e) {}
    }
  } else if (isObject(obj)) {
    for (let i in obj) {
      try {
        manage(obj, i);
      } catch (e) {}
    }
  }
  return obj;
}

async function getDeposits(req, user, onlyLocked, tokenTypes = []) {
  const mainPool = getContract(req, "MainPool");
  if (mainPool) {
    let deposits = [];
    const len = await mainPool.getDepositsLength(user);
    for (let x = 0; x < len; x++) {
      let deposit = _.pick(await mainPool.getDepositByIndex(user, x), [
        "tokenType",
        "lockedFrom",
        "lockedUntil",
        "tokenAmountOrID",
        "unlockedAt",
        "otherChain",
        "mainIndex",
        "extra",
      ]);
      if (
        (onlyLocked && deposit.unlockedAt !== 0) ||
        (tokenTypes.length > 0 && !tokenTypes.includes(deposit.tokenType))
      ) {
        continue;
      }
      deposits.push(deposit);
    }
    return deposits;
  }
}

module.exports = {
  getUrl,
  getNetwork,
  getContract,
  timestamp,
  resError,
  bigNumberify,
  getDeposits,
};
