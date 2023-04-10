require("dotenv").config();
const Case = require("case");
const ethers = require("ethers");
const eventManager = require("./EventManager");
const { providers, eventsConfig, contracts } = require("../config");
const inputJson = require("../config/events.js");
let failedEvents = [];

let options = {
  //
};

const LIMIT_BLOCK_MAX = 1000;
function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}
function isApiLimitExceeded(start, end) {
  return end > start && end - start > LIMIT_BLOCK_MAX;
}

async function midPoint(start, end) {
  const midBlock = Math.floor((start + end) / 2);
  return midBlock;
}

async function getEvents(contract, type, start, end, contractName) {
  log(`=> Getting event ${type}: ${start}< block <${end}`);
  if (isApiLimitExceeded(start, end)) {
    ` ! API block limit exceeded, splitting request`;
    const mid = await midPoint(start, end);
    await getEvents(contract, type, start, mid, contractName);
    await getEvents(contract, type, mid + 1, end, contractName);
    return;
  }
  try {
    const response = await contract.queryFilter(type, start, end, contractName);
    if (response.length > 0) {
      const txs = await processEvents(response, type, contractName);
      const eventName = response[0].event;
      await eventManager.updateEvents(txs, eventName, contractName);
    }
  } catch (error) {
    console.log(error);
    log(` ! API error, splitting request to void limit and timeout`);
    const mid = await midPoint(start, end);
    await getEvents(contract, type, start, mid, contractName);
    await getEvents(contract, type, mid + 1, end, contractName);
  }
  return;
}

async function getFutureEvents(contract, type, eventName, contractName) {
  log(`Starting Monitor for ${contractName} on event ${eventName}`);
  contract.on(eventName, async (...args) => {
    const event = [args[args.length - 1]];
    const txs = await processEvents(event, type, contractName);
    await eventManager.updateEvents(txs, eventName, contractName);
  });
}

async function processEvents(events, type, contractName) {
  let processedEvents = [];

  let argNames = [];
  for (const contract of inputJson) {
    if (contract.contractName === contractName) {
      for (const inputEvent of contract.events) {
        if (inputEvent.name === events[0].event) {
          for (let abi of inputEvent.ABI[0].inputs) {
            argNames.push(abi.name);
          }
        }
      }
    }
  }

  for (let event of events) {
    const tx = await processSingleEvent(event, type, argNames);
    if (tx !== undefined) {
      processedEvents.push(tx);
    }
  }
  return processedEvents;
}

async function processSingleEvent(event, type, argNames) {
  let tx;
  const { transactionHash, blockNumber } = event;
  try {
    tx = {
      transaction_hash: transactionHash,
      block_number: blockNumber,
    };

    for (let arg of argNames) {
      const dataArg = Case.snake(arg);
      if (typeof event.args[arg] === "object") {
        tx[dataArg] = Number(event.args[arg]);
      } else {
        tx[dataArg] = event.args[arg];
      }
    }
  } catch (error) {
    failedEvents.push({ event: event, type: type });
    console.log(error);
  }
  return tx;
}

async function getStartBlock(eventConfig, contractName, eventName) {
  let startBlock;
  let lastEvent = await eventManager.latestEvent(contractName, eventName);
  if (lastEvent) {
    startBlock = lastEvent.block_number + 1;
  } else {
    startBlock = eventConfig.startBlock;
  }
  return startBlock;
}

async function getEventInfo(eventConfig, eventName, eventFilter, eventABI) {
  const { chainId: eventChainId, contractName } = eventConfig;
  let contract;
  let startBlock = await getStartBlock(eventConfig, contractName, eventName);
  const provider = providers[eventChainId];

  contract = new ethers.Contract(contracts[eventChainId][contractName], eventABI, provider);
  const type = contract.filters[eventFilter]();

  const endBlock = await provider.getBlockNumber();

  await getEvents(contract, type, startBlock, endBlock, contractName);

  await getFutureEvents(contract, type, eventName, contractName);
}

async function main(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }
  const promises = [];

  for (let eventConfig of eventsConfig) {
    for (let event of eventConfig.events) {
      let name = event.name;
      let filter = event.filter;
      let abi = event.ABI;
      promises.push(getEventInfo(eventConfig, name, filter, abi));
    }
  }

  const results = await Promise.all(promises);
}

module.exports = main;
