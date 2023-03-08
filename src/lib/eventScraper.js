require("dotenv").config();
const ethers = require("ethers");
const dbManager = require("./DbManager");
const { providers, abi, eventsConfig, contracts } = require("../config");
const inputJson = require("../config/events.json");
const { eventNames } = require("process");
// const transactions = require("./transactions");
let options = {
  //
};

const LIMIT_BLOCK_MAX = 1000;
function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

// returns start block
// async function startPoint(type, blockNumber, provider) {
//   const time = (await ethProvider.getBlock(blockNumber)).timestamp;
//   return { timestamp: time, block: blockNumber };
// }
//
// async function endPoint(provider) {
//   const blockNum = await provider.getBlockNumber();
//   let end = { timestamp: Date.now() / 1000, block: blockNum };
//   return { timestamp: end.timestamp, block: end.block };
// }
//
// function getTargetEvent(contractName, eventName, provider) {
//   const conf = eventsConfig[contractName];
//   const address = contracts[conf.chainId][contractName];
//   const contract = new ethers.Contract(address, abi[contractName], provider);
//   return contract.filters[eventName]();
// }

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
    console.log(mid);
    await getEvents(contract, type, start, mid, contractName);
    await getEvents(contract, type, mid + 1, end, contractName);
    return;
  }
  try {
    const response = await contract.queryFilter(type, start, end, contractName);
    if (response.length > 0) {
      const txs = await processEvents(response, type, start, contractName);
      const event = response[0].event;
      await dbManager.updateEvents(txs, event, contractName);
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

async function getFutureEvents(contract, eventName, contractName) {
  contract.on("Transfer", async (from, to, value, event) => {
    console.log(event);
  });
}

async function processEvents(events, type, start, contractName) {
  let processedEvents = [];

  let argNames = [];
  for (const contract of inputJson) {
    if (contract.contractName === contractName) {
      for (const inputEvent of contract.events) {
        if (inputEvent.name === events[0].event) {
          for (let i of inputEvent.params) argNames.push(i.name);
        }
      }
    }
  }

  for (let event of events) {
    const tx = await processSingleEvent(event, type, start, argNames);
    if (tx !== undefined) {
      processedEvents.push(tx);
    }
  }
  return processedEvents;
}

async function processSingleEvent(event, type, start, argNames) {
  let tx;
  const { transactionHash, blockNumber } = event;
  try {
    timestamp = (await event.getBlock()).timestamp;
    if (timestamp <= start.timestamp) return;
    tx = {
      transaction_hash: transactionHash,
      block_number: blockNumber,
    };

    for (let arg of argNames) {
      const dataArg = arg.toLowerCase();
      if (typeof event.args[arg] == "object") {
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

async function getEventInfo(eventConfig, eventName) {
  const { chainId: eventChainId, contractName, startBlock } = eventConfig;
  const provider = providers[eventChainId];
  const contract = new ethers.Contract(
    contracts[eventChainId][contractName],
    abi[contractName],
    provider
  );
  const type = contract.filters[eventName]();
  const endBlock = await provider.getBlockNumber();

  // await getEvents(contract, type, startBlock, endBlock, contractName);

  // provider.on(type, async (event) => {
  //   console.log(event);
  // });

  await getFutureEvents(contract, eventName, contractName);
}

async function main(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }
  const promises = [];

  for (let eventConfig of eventsConfig) {
    for (let event of eventConfig.events) {
      promises.push(getEventInfo(eventConfig, event.name));
    }
  }

  const results = await Promise.all(promises);

  // console.log(results);
}

module.exports = main;
