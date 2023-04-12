require("dotenv").config();
const Case = require("case");
const ethers = require("ethers");
const eventManager = require("./EventManager");
const Moralis = require("moralis").default;
const Web3 = require("web3");
const web3 = new Web3();
const _ = require("lodash");

const { providers, eventsByContract, contracts } = require("../config");
const { nameTable } = require("../utils");
const requestHandler = require("./requestHandler");

let failedEvents = [];

let options = {
  //
};

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

async function getEventsByFilter(opt) {
  let { filter, contractName, eventConfig, filterName, contract } = opt;
  let logs;
  let topic = web3.utils.keccak256(opt.filterName);
  const count = options.fromZero
    ? 0
    : await countEvents(contractName, eventConfig.filter);
  let offset = count > 100 ? count - 100 : count;
  let limit = 500;
  do {
    const response = await requestHandler(
      Moralis.EvmApi.events.getContractEvents({
        chain: "0x" + eventConfig.chainId.toString(16),
        address: contract.address,
        limit,
        offset,
        topic,
        abi: eventConfig.ABI[0],
      })
    );
    logs = response.jsonResponse.result;
    if (logs.length > 0) {
      const txs = await processEvents(logs, filter, contractName, eventConfig);
      log(
        `Inserting ${txs.length} rows ${nameTable(contractName, filterName)}`
      );
      await eventManager.updateEvents(txs, filterName, contractName);
    }
    offset += limit;
  } while (logs.length > 0);
}

async function processEvents(response, filter, contractName, eventConfig) {
  const processedEvents = [];
  const argNames = eventConfig.ABI[0].inputs.map((e) => e.name);
  const argTypes = eventConfig.ABI[0].inputs.map((e) => e.type);
  for (let event of response) {
    const tx = await processSingleEvent(event, filter, argNames, argTypes);
    if (tx !== undefined) {
      processedEvents.push(tx);
    }
  }
  return processedEvents;
}

async function getFutureEvents(
  contract,
  type,
  eventName,
  contractName,
  eventConfig
) {
  log(`Starting Monitor for ${contractName} on event ${eventName}`);
  contract.on(eventName, async (...args) => {
    const event = [args[args.length - 1]];
    const txs = await processEvents(event, type, contractName, eventConfig);
    await eventManager.updateEvents(txs, eventName, contractName);
  });
}

async function processSingleEvent(event, filter, argNames, argTypes) {
  let tx;
  // handle the different formats returned by Infura and Moralis APIs
  const { transactionHash, blockNumber, transaction_hash, block_number } =
    event;
  const key = transaction_hash ? "data" : "args";
  try {
    tx = {
      transaction_hash: transactionHash || transaction_hash,
      block_number: blockNumber || block_number,
    };
    for (let i = 0; i < argNames.length; i++) {
      const arg = argNames[i];
      const type = argTypes[i];
      const dataArg = Case.snake(arg);
      switch (type) {
        case "uint256":
          tx[dataArg] = event[key][arg].toString();
          break;
        case "boolean":
          tx[dataArg] =
            (typeof event[key][arg] === "boolean" && event[key][arg]) ||
            /true/i.test(event[key][arg])
              ? "TRUE"
              : "FALSE";
          break;
        default:
          tx[dataArg] = event[key][arg];
      }
    }
  } catch (error) {
    failedEvents.push({ event: event, type: filter });
    console.log(error);
  }
  return tx;
}

async function countEvents(contractName, filter) {
  const result = await eventManager.countEvents(contractName, filter);
  return parseInt(result.count);
}

async function getEventInfo(contractName, eventConfig, getStarted) {
  log(
    `Getting ${getStarted ? "initial " : ""}"${
      eventConfig.name
    }" events from "${contractName}"`
  );

  const { chainId } = eventsByContract[contractName];
  eventConfig.chainId = chainId;
  const { name, filter: filterName, ABI } = eventConfig;
  const provider = providers[chainId];
  const contract = new ethers.Contract(
    contracts[chainId][contractName],
    ABI,
    provider
  );
  const filter = contract.filters[filterName]();
  const opt = {
    filter,
    contractName,
    eventConfig,
    filterName,
    contract,
  };
  if (getStarted) {
    log("Launching initial event fetch");
    await getEventsByFilter(opt);
  } else {
    await getFutureEvents(contract, filter, name, contractName, eventConfig);
  }
}

async function getEvents(subscribe) {
  const promises = [];
  for (let contractName in eventsByContract) {
    if (!options.contract || contractName === options.contract) {
      for (let eventConfig of eventsByContract[contractName].events) {
        if (!options.event || eventConfig.name === options.event) {
          if (subscribe) {
            promises.push(getEventInfo(contractName, eventConfig));
          } else {
            await getEventInfo(contractName, eventConfig, true);
          }
        }
      }
    }
  }
  if (subscribe) {
    return Promise.all(promises);
  }
}

async function main(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }
  await Moralis.start({
    apiKey: process.env.MORALIS,
  });

  await getEvents();
  if (options.contract || options.event) {
    return;
  }
  await getEvents("subscribe");
}

module.exports = main;
