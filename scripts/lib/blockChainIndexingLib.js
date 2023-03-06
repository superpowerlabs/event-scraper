require("dotenv").config();
const ethers = require("ethers");

const abis = require("../../src/config/ABIs.json").contracts;
const transactions = require("../../server/lib/transactions");

const configuration = require("../input/configuration.json").contracts;

let provider;
let options = {};
let failedEvents = [];

const LIMIT_BLOCK_MIN = 1000;
const LIMIT_BLOCK_MAX = 10000;

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

// To work around API limitations (infura and etherscan)
// A max of 10,000 results can be returned by a single query
// Query duration must not exceed 10 seconds
function isApiLimitExceeded(start, end) {
  return (
    end > start &&
    end - start > LIMIT_BLOCK_MIN &&
    end - start > LIMIT_BLOCK_MAX
  );
}

// returns start block
async function startPoint(etype) {
  await transactions.init();
  let tx = await transactions.latest(etype);
  if (tx) {
    // console.log("Starting after block: ",tx.block);
    return {
      timestamp: Number(tx.timestamp),
      block: Number(tx.block),
    };
  } else {
    // console.log("No transactions found, using block (14173085)");
    return { timestamp: 1644425832, block: 14173085 }; // first tx for this contract
    // return { timestamp: 1674863615, block: 16501853 }; // for testing
  }
}

async function endPoint() {
  const blockNum = await provider.getBlockNumber();
  let end = { timestamp: Date.now() / 1000, block: blockNum };
  return { timestamp: end.timestamp, block: end.block };
}

async function midPoint(start, end) {
  const midBlock = Math.floor((start.block + end.block) / 2);
  const midTimestamp = (await provider.getBlock(midBlock)).timestamp;
  return { timestamp: midTimestamp, block: midBlock };
}

function eventTypes() {
  const events = {};
  const contracts = Object.keys(configuration);
  for (let contractName of contracts) {
    for (let evenInfo of configuration[contractName].Events) {
      const eventName = Object.keys(evenInfo)[0];
      const address = configuration[contractName].Address;
      const contract = new ethers.Contract(
        address,
        abis[contractName],
        provider
      );
      const event = contract.filters[eventName]();
      events[eventName] = event;
    }
  }
  return events;
}

function amount(args, type) {
  const amount = parseInt(ethers.utils.formatEther(args.amount).toString());
  return type === "Unstaked" ? -amount : amount;
}

//
// processes a single event
// skips events that are younger than the starting point
// returns a transaction object or undefined if event is skipped
//
async function processSingleEvent(event, type, start) {
  let timestamp = -1;
  let tx;
  const { args, transactionHash, blockNumber } = event;
  try {
    timestamp = (await event.getBlock()).timestamp;
    // we skip YieldClaimed events that are not for the SYNR token (sSyn :False)
    if (type === "YieldClaimed" && !args.sSyn) return;
    if (timestamp <= start.timestamp) return;
    tx = {
      hash: transactionHash,
      timestamp,
      block: blockNumber,
      amount: amount(args, type),
      etype: type,
    };
  } catch (error) {
    failedEvents.push({ event: event, type: type });
    console.log(error);
  }
  return tx;
}

// processes a list of events
async function processEvents(events, type, start) {
  let processedEvents = [];
  for (let event of events) {
    const tx = await processSingleEvent(event, type, start);
    if (tx !== undefined) {
      processedEvents.push(tx);
    }
  }
  return processedEvents;
}

// get all the events for event type
// input: type of event, start point, end point,
// note: handles API limits
// returns a list of events
async function getEvents(type, start, end) {
  const contract = new ethers.Contract(address, abi, provider);
  log(`=> Getting event ${type}: ${start.block}< block <${end.block}`);
  if (isApiLimitExceeded(start.block, end.block)) {
    ` ! API block limit exceeded, splitting request`;
    const mid = await midPoint(start, end);
    await getEvents(type, start, mid);
    await getEvents(type, mid, end);
    return;
  }
  try {
    const response = await contract.queryFilter(type, start.block, end.block);
    const txs = await processEvents(response, type, start);
    if (!options.dryrun) {
      await persistTransactionsToDB(txs);
    }
  } catch (error) {
    log(` ! API error, splitting request to void limit and timeout`);
    const mid = await midPoint(start, end);
    await getEvents(type, start, mid);
    await getEvents(type, mid, end);
  }
  return;
}

// persist transactions to db
async function persistTransactionsToDB(tsx) {
  if (tsx.length === 0) return;
  console.info(`Persisting ${tsx.length} transactions to db`);
  try {
    await transactions.batchInsert(tsx);
  } catch (error) {
    console.error("Failed to persist transactions to db: \n", error);
  }
}

async function main(opt) {
  if (opt) {
    options = opt;
  }
  provider = new ethers.providers.InfuraProvider(
    "homestead",
    process.env.INFURA_KEY
  );

  //get all events
  const eventsList = eventTypes();
  console.log(eventsList);

  let end = await endPoint();

  for (let type in event_types) {
    let start = await startPoint(type);
    console.info(
      `Getting events ${type} volumes from ${start.block} to ${end.block}`
    );
    await getEvents(type, start, end);
  }
  console.timeEnd("Events");
  log(await transactions.aggregate());
}

module.exports = main;
