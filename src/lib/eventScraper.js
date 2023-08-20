require("dotenv").config();
const Case = require("case");
const ethers = require("ethers");
const eventManager = require("./EventManager");
const Moralis = require("moralis").default;
const _ = require("lodash");

const {
  providers,
  eventsByContract,
  contracts,
  supportedByMoralis,
} = require("../config");
const { nameTable, sleep } = require("../utils");
const requestHandler = require("./requestHandler");

let options = {};

const timestampCache = {};

async function getTimestampFromBlock(chainId, blockNumber) {
  if (!timestampCache[chainId]) {
    timestampCache[chainId] = {};
  }
  if (!timestampCache[chainId][blockNumber]) {
    if (typeof timestampCache[chainId][blockNumber] === "undefined") {
      timestampCache[chainId][blockNumber] = 0;
      const block = await providers[chainId].getBlock(blockNumber);
      timestampCache[chainId][blockNumber] = block.timestamp;
    } else {
      while (!timestampCache[chainId][blockNumber]) {
        await sleep(100);
      }
    }
  }
  return new Date(timestampCache[chainId][blockNumber] * 1000).toISOString();
}

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

async function getFromBlock(contractName, filterName, startBlock) {
  let fromBlock = startBlock;
  if (!options.force) {
    let latestEventBlock = await eventManager.latestBlockByEvent(
      contractName,
      filterName
    );
    if (latestEventBlock < startBlock) {
      latestEventBlock = startBlock;
    }
    if (latestEventBlock) {
      fromBlock = latestEventBlock - (options.blocks || -1);
      if (fromBlock < 0) fromBlock = startBlock;
    }
  }
  return fromBlock;
}

async function retrieveHistoricalEvents(params) {
  let { filter, contractName, eventConfig, filterName, contract } = params;
  const { chainId } = eventConfig;
  let logs = [];

  let fromBlock = await getFromBlock(
    contractName,
    filterName,
    options.startingBlock || eventConfig.startBlock
  );
  if (options.force) {
    // we clean the table
    await eventManager.truncateEvents(filterName, contractName);
  }
  let offset = 0;
  let limit = options.limit || 500;
  do {
    if (supportedByMoralis[chainId]) {
      logs = await getEventsViaMoralis(params, limit, offset, fromBlock);
    } else {
      logs = await getEventsFromRPC(params, limit, offset, fromBlock);
    }
    if (logs.length > 0) {
      let from = logs[0].block_number;
      let to = logs[logs.length - 1].block_number;
      const txs = await processEvents(logs, filter, contractName, eventConfig);
      const [expected, inserted] = await eventManager.updateEvents(
        txs,
        filterName,
        contractName
      );
      console.info(
        `Inserting ${inserted} of ${expected} rows into ${nameTable(
          contractName,
          filterName
        )}\n  from block ${from} to ${to}`
      );
    }
    if (logs.length < limit) {
      break;
    }
    offset += limit;
  } while (logs.length > 0);
}

async function getEventsViaMoralis(params, limit, offset, fromBlock) {
  let { filter, eventConfig, contract } = params;
  return (
    await requestHandler(
      Moralis.EvmApi.events.getContractEvents({
        chain: "0x" + eventConfig.chainId.toString(16),
        address: contract.address,
        limit,
        offset,
        topic: filter.topics[0],
        abi: eventConfig.ABI[0],
        fromBlock,
      })
    )
  ).jsonResponse.result;
}

function toHexString(value) {
  let str = value.toString(16);
  if (str.length % 2) {
    str = "0" + str;
  }
  return "0x" + str;
}

async function getEventsFromRPC(params, limit, offset, fromBlock) {
  let { eventConfig, contract, filter } = params;
  const provider = providers[eventConfig.chainId];
  filter = Object.assign(filter, {
    fromBlock,
  });
  const logs = await provider.getLogs(filter);
  const transferEvents = logs.map((log) => {
    let data = contract.interface.parseLog(log).args;
    log.data = {};
    for (let key in data) {
      if (/^\d+$/.test(key)) continue;
      log.data[key] = data[key];
    }
    log.block_number = log.blockNumber;
    delete log.topics;
    return log;
  });
  return transferEvents;
}

// async function getEventsFromRPC(params, limit, offset, fromBlock) {
//   const { filterName, contract } = params;
//   const filter = contract.filters[filterName]();
//   return contract.queryFilter(filter, toHexString(fromBlock), "latest");
// }

async function processEvents(response, filter, contractName, eventConfig) {
  const { chainId } = eventConfig;
  if (Object.keys(timestampCache[chainId] || []).length > 1000) {
    // we partially empty the timestamp cache
    let j = 0;
    for (let key in timestampCache[chainId]) {
      if (++j > 500) break;
      delete timestampCache[chainId][key];
    }
  }
  const processedEvents = [];
  const argNames = eventConfig.ABI[0].inputs.map((e) => e.name);
  const argTypes = eventConfig.ABI[0].inputs.map((e) => e.type);
  for (let event of response) {
    const tx = await processSingleEvent(
      event,
      filter,
      argNames,
      argTypes,
      eventConfig
    );
    if (tx !== undefined) {
      processedEvents.push(tx);
    }
  }
  return processedEvents;
}

async function retrieveRealtimeEvents(
  contract,
  type,
  eventName,
  contractName,
  eventConfig,
  filterName
) {
  console.info(`Monitoring ${contractName} on event ${eventName}`);
  contract.on(eventName, async (...args) => {
    const event = [args[args.length - 1]];
    const txs = await processEvents(event, type, contractName, eventConfig);
    try {
      const [expected, inserted] = await eventManager.updateEvents(
        txs,
        filterName,
        contractName
      );
      console.info(
        `Inserting ${inserted} of ${expected} rows into ${nameTable(
          contractName,
          filterName
        )}`
      );
    } catch (error) {
      console.error(">>>>>>> Error updateEvents");
      console.error(error);
    }
  });
}

async function processSingleEvent(...args) {
  if (args[0].transaction_hash) {
    return processMoralisEvent(...args);
  } else {
    return processRPCEvent(...args);
  }
}

function formatAttribute(arg, type, data) {
  switch (type) {
    case "uint256":
      return data[arg].toString();
    case "boolean":
      return (typeof data[arg] === "boolean" && data[arg]) ||
        /true/i.test(data[arg])
        ? "TRUE"
        : "FALSE";
    default:
      return data[arg];
  }
}

async function processMoralisEvent(event, filter, argNames, argTypes) {
  let tx;
  const { transaction_hash, block_number, block_timestamp } = event;
  try {
    tx = {
      transaction_hash,
      block_number,
      block_timestamp,
    };
    for (let i = 0; i < argNames.length; i++) {
      const dataArg = Case.snake(argNames[i]);
      tx[dataArg] = formatAttribute(argNames[i], argTypes[i], event.data);
    }
  } catch (error) {
    // this should never happen
    logFailedEvent(event, filter, error);
  }
  return tx;
}

async function processRPCEvent(event, filter, argNames, argTypes, eventConfig) {
  let tx;
  const { transactionHash: transaction_hash, blockNumber: block_number } =
    event;
  try {
    const block_timestamp = await getTimestampFromBlock(
      eventConfig.chainId,
      block_number
    );
    tx = {
      transaction_hash,
      block_timestamp,
      block_number,
    };
    const data = event.data;
    for (let i = 0; i < argNames.length; i++) {
      const dataArg = Case.snake(argNames[i]);
      tx[dataArg] = formatAttribute(argNames[i], argTypes[i], data);
    }
  } catch (error) {
    // console.log("error", error);
    // this should never happen
    logFailedEvent(event, filter, error);
  }
  // process.exit()
  return tx;
}

function logFailedEvent(event, filter, error) {
  console.error(`

Failed to process event with filter 
${JSON.stringify(filter)}:
Event:
${JSON.stringify(event)}
Error:
${error.message}`);
}

async function getEventInfo(contractName, eventConfig, getStarted) {
  log(
    `Getting ${getStarted ? "historical " : ""}"${
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
  if (getStarted) {
    await retrieveHistoricalEvents({
      filter,
      contractName,
      eventConfig,
      filterName,
      contract,
    });
  } else {
    await retrieveRealtimeEvents(
      contract,
      filter,
      name,
      contractName,
      eventConfig,
      filterName
    );
  }
}

let started = false;

async function eventScraper(opt) {
  console.log("Starting event scraper in", opt.scope, "mode");
  if (opt) {
    options = Object.assign(options, opt);
  }
  if (!started) {
    started = true;
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }
  const promises = [];
  for (let contractName in eventsByContract) {
    // if (
    //   (options.debug && contractName !== "USDC") ||
    //   (!options.debug && contractName === "USDC")
    // ) {
    //   continue;
    // }
    if (!options.contract || contractName === options.contract) {
      for (let eventConfig of eventsByContract[contractName].events) {
        eventConfig.startBlock = eventsByContract[contractName].startBlock;
        eventConfig.chainId = eventsByContract[contractName].chainId;
        if (!options.event || eventConfig.name === options.event) {
          if (options.scope === "historical") {
            await getEventInfo(contractName, eventConfig, true);
          } else if (options.scope === "realtime") {
            promises.push(getEventInfo(contractName, eventConfig));
          } else {
            // uhm...
            console.error("Unknown scope");
            break;
          }
        }
      }
    }
  }
  if (options.scope === "realtime") {
    await Promise.all(promises);
    // this is a hack to keep the process alive
    return new Promise(() => {});
  } else {
    return true;
  }
}

module.exports = eventScraper;
