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
  averageBlockPerDay,
  abi,
} = require("../config");
const { nameTable, sleep } = require("../utils");
const requestHandler = require("./requestHandler");

let failedEvents = [];
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
  return new Date(timestampCache[chainId][blockNumber]).toISOString();
}

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

async function getFromBlock(contractName, filterName) {
  let fromBlock;
  if (!options.force) {
    const latestEventBlock = await eventManager.latestBlockByEvent(
      contractName,
      filterName
    );
    if (latestEventBlock) {
      fromBlock = latestEventBlock - (options.blocks || -1);
      if (fromBlock < 0) fromBlock = undefined;
    }
  }
  return fromBlock;
}

async function retrieveHistoricalEvents(params) {
  let { filter, contractName, eventConfig, filterName, contract } = params;
  let logs;
  let topic = ethers.utils.id(params.filterName);
  let fromBlock = await getFromBlock(contractName, filterName);
  let offset = 0;
  let limit = options.limit || 500;
  do {
    const response = await requestHandler(
      Moralis.EvmApi.events.getContractEvents({
        chain: "0x" + eventConfig.chainId.toString(16),
        address: contract.address,
        limit,
        offset,
        topic,
        abi: eventConfig.ABI[0],
        fromBlock,
      })
    );
    logs = response.jsonResponse.result;
    if (logs.length > 0) {
      let from = logs[0].block_number;
      let to = logs[logs.length - 1].block_number;
      const txs = await processEvents(logs, filter, contractName, eventConfig);
      console.info(
        `Inserting ${txs.length} rows into ${nameTable(
          contractName,
          filterName
        )}\n  from block ${from} to ${to}`
      );
      await eventManager.updateEvents(txs, filterName, contractName);
    }
    offset += limit;
  } while (logs.length > 0);
}

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

async function processMoralisStreamEvent(stream) {
  console.log("Stream event function");
  const chainId = parseInt(stream.chainId);
  const relevantContracts = contracts[chainId];
  for (let log of stream.logs) {
    const topic0 = log.topic0;
    let contractName;
    for (const key in relevantContracts) {
      if (relevantContracts[key].toLowerCase() === log.address.toLowerCase()) {
        contractName = key;
        break;
      }
    }
    const possibleEvents = eventsByContract[contractName];
    let event;
    for (let possibleEvent of possibleEvents.events) {
      const signature = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(possibleEvent.filter)
      );
      if (signature === topic0) {
        event = possibleEvent;
        break;
      }
    }

    const topics = event.ABI[0].inputs;
    let data = {};
    data.transaction_hash = log.transactionHash;
    data.block_number = stream.block.number;
    data.block_timestamp = await getTimestampFromBlock(
      eventsByContract[contractName].chainId,
      Number(stream.block.number)
    );
    for (let i in topics) {
      const name = Case.snake(topics[i].name);
      data[name] = ethers.utils.defaultAbiCoder.decode(
        [topics[i].type],
        log[`topic${Number(i) + 1}`]
      )[0];
      if (topics[i].type === "uint256") {
        data[name] = data[name].toString();
      }
      //not sure if bool or boolean
      if (topics[i].type === "bool") {
        data[name] =
          (typeof data[name] === "boolean" && data[name]) ||
          /true/i.test(data[name])
            ? "TRUE"
            : "FALSE";
      }
    }
    console.info(
      `Inserting 1 event into ${nameTable(contractName, event.filter)}\n`
    );
    await eventManager.updateEvents([data], event.filter, contractName);
  }
}

async function processRPCEvent(event, filter, argNames, argTypes, eventConfig) {
  let tx;
  const { transactionHash, blockNumber } = event;
  try {
    tx = {
      transaction_hash: transactionHash,
      block_timestamp: await getTimestampFromBlock(
        eventConfig.chainId,
        blockNumber
      ),
      block_number: blockNumber,
    };
    for (let i = 0; i < argNames.length; i++) {
      const dataArg = Case.snake(argNames[i]);
      tx[dataArg] = formatAttribute(argNames[i], argTypes[i], event.args);
    }
  } catch (error) {
    // this should never happen
    logFailedEvent(event, filter, error);
  }
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

async function getEventInfo(contractName, eventConfig) {
  log(`Getting Historical"${eventConfig.name}" events from "${contractName}"`);

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
  await retrieveHistoricalEvents({
    filter,
    contractName,
    eventConfig,
    filterName,
    contract,
  });
}

async function retrieveRealtimeEventsMoralis(contractName, existingStreams) {
  for (let stream of existingStreams.result) {
    if (stream.tag === contractName) {
      await Moralis.Streams.delete({
        id: stream.id,
      });
    }
  }
  console.info(`Monitoring ${contractName}`);
  const contract = eventsByContract[contractName];
  const address = contracts[contract.chainId][contractName];
  let contractABI = [];
  let eventTopics = [];
  for (let event of contract.events) {
    eventTopics.push(event.filter);
    contractABI.push(event.ABI[0]);
  }
  const options = {
    chains: [contract.chainId],
    description: `Monitor Target Events in ${contractName}`,
    tag: `${contractName}`,
    abi: contractABI,
    includeContractLogs: true,
    allAddresses: false,
    topic0: eventTopics,
    webhookUrl: process.env.WEBHOOK_ENDPOINT, // webhook url for receiving events
  };
  try {
    const stream = await Moralis.Streams.add(options);
    const { id } = stream.toJSON();
    await Moralis.Streams.addAddress({
      id: id,
      address: address,
    });
  } catch (e) {
    console.log("MORALIS API RETURNED ERROR: Trying again");
    const newStreams = (
      await Moralis.Streams.getAll({
        limit: 100,
      })
    ).raw;
    await retrieveRealtimeEventsMoralis(contractName, newStreams);
    console.log(`Success with ${contractName}`);
  }
  return;
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

  const existingStreams = (
    await Moralis.Streams.getAll({
      limit: 100,
    })
  ).raw;

  for (let contractName in eventsByContract) {
    if (
      (options.debug && contractName !== "USDC") ||
      (!options.debug && contractName === "USDC")
    ) {
      continue;
    }
    if (!options.contract || contractName === options.contract) {
      if (options.scope === "realtime") {
        await sleep(3000);
        await retrieveRealtimeEventsMoralis(contractName, existingStreams);
      }
      for (let eventConfig of eventsByContract[contractName].events) {
        if (!options.event || eventConfig.name === options.event) {
          if (options.scope === "historical") {
            await getEventInfo(contractName, eventConfig);
          }
        }
      }
    }
  }
  return true;
}

module.exports = { eventScraper, processMoralisStreamEvent };
