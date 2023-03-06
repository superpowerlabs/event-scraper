require("dotenv").config();
const ethers = require("ethers");
const {
  BNB_CHAIN_RPC_URL,
  BNB_CHAIN_ID,
  abi,
  eventsConfig,
  contracts,
} = require("../config");

// const transactions = require("./transactions");

const ethProvider = new ethers.providers.InfuraProvider(
  "homestead",
  process.env.INFURA_KEY
);

const bscProvider = new ethers.providers.JsonRpcProvider(
  BNB_CHAIN_RPC_URL,
  BNB_CHAIN_ID
);

let options = {};

// Uncomment, if/when needed

// let failedEvents = [];
//
// const LIMIT_BLOCK_MIN = 1000;
// const LIMIT_BLOCK_MAX = 10000;
//
// function log(...params) {
//   if (options.verbose) {
//     console.debug(...params);
//   }
// }

// returns start block
async function startPoint(type, blockNumber, provider) {
  const time = (await ethProvider.getBlock(blockNumber)).timestamp;
  return { timestamp: time, block: blockNumber };
}

async function endPoint(provider) {
  const blockNum = await provider.getBlockNumber();
  let end = { timestamp: Date.now() / 1000, block: blockNum };
  return { timestamp: end.timestamp, block: end.block };
}

function getTargetEvent(contractName, eventName, provider) {
  const conf = eventsConfig[contractName];
  const address = contracts[conf.chainId][contractName];
  const contract = new ethers.Contract(address, abi[contractName], provider);
  return contract.filters[eventName]();
}

async function getEventInfo(eventConfig, eventName) {
  const { chainId: eventChainId, contractName, startBlock } = eventConfig;
  const provider = eventChainId === "1" ? ethProvider : bscProvider;
  const contract = new ethers.Contract(
    contracts[eventChainId][contractName],
    abi[contractName],
    provider
  );
  const type = contract.filters[eventName]();
  const endBlock = await provider.getBlockNumber();
  console.log(endBlock);

  // TODO, this will exceed the API limit
  // Implement the functions Yacin put in place in the original script to
  // avoid the issue.
  const response = await contract.queryFilter(type, startBlock, endBlock);

  // save in the db if needed
}

async function main(opt) {
  if (opt) {
    options = opt;
  }
  const promises = [];

  for (let eventConfig of eventsConfig) {
    for (let event of eventConfig.events) {
      promises.push(getEventInfo(eventConfig, event));
    }
  }

  const results = await Promise.all(promises);
  // console.log(results)
}

module.exports = main;

// Unused functions.
// Move them back if, when needed

// async function midPoint(start, end) {
//   const midBlock = Math.floor((start.block + end.block) / 2);
//   const midTimestamp = (await ethProvider.getBlock(midBlock)).timestamp;
//   return { timestamp: midTimestamp, block: midBlock };
// }

// function amount(args, type) {
//   const amount = parseInt(ethers.utils.formatEther(args.amount).toString());
//   return type === "Unstaked" ? -amount : amount;
// }

//
// processes a single event
// skips events that are younger than the starting point
// returns a transaction object or undefined if event is skipped
//
// async function processSingleEvent(event, type, start) {
//   let timestamp = -1;
//   let tx;
//   const { args, transactionHash, blockNumber } = event;
//   try {
//     timestamp = (await event.getBlock()).timestamp;
//     // we skip YieldClaimed events that are not for the SYNR token (sSyn :False)
//     if (type === "YieldClaimed" && !args.sSyn) return;
//     if (timestamp <= start.timestamp) return;
//     tx = {
//       hash: transactionHash,
//       timestamp,
//       block: blockNumber,
//       amount: amount(args, type),
//       type,
//     };
//   } catch (error) {
//     failedEvents.push({ event: event, type: type });
//     console.log(error);
//   }
//   return tx;
// }

// processes a list of events
// async function processEvents(events, type, start) {
//   let processedEvents = [];
//   for (let event of events) {
//     const tx = await processSingleEvent(event, type, start);
//     if (tx !== undefined) {
//       processedEvents.push(tx);
//     }
//   }
//   return processedEvents;
// }

// get all the events for event type
// input: type of event, start point, end point,
// note: handles API limits
// returns a list of events
// async function getOldEvents(type, start, end, abi, provider) {
//   console.log("getting old");
//   const contract = new ethers.Contract(address, abi, provider);
//   log(`=> Getting event ${type}: ${start.block}< block <${end.block}`);
//   if (isApiLimitExceeded(start.block, end.block)) {
//     ` ! API block limit exceeded, splitting request`;
//     const mid = await midPoint(start, end);
//     await getEvents(type, start, mid);
//     await getEvents(type, mid, end);
//     return;
//   }
//   try {
//     const response = await contract.queryFilter(type, start.block, end.block);
//     const txs = await processEvents(response, type, start);
//     if (!options.dryrun) {
//       await persistTransactionsToDB(txs);
//     }
//   } catch (error) {
//     log(` ! API error, splitting request to void limit and timeout`);
//     const mid = await midPoint(start, end);
//     await getEvents(type, start, mid);
//     await getEvents(type, mid, end);
//   }
//   return;
// }

// persist transactions to db
// async function persistTransactionsToDB(tsx) {
//   if (tsx.length === 0) return;
//   console.info(`Persisting ${tsx.length} transactions to db`);
//   try {
//     await transactions.batchInsert(tsx);
//   } catch (error) {
//     console.error("Failed to persist transactions to db: \n", error);
//   }
// }

// To work around API limitations (infura and etherscan)
// A max of 10,000 results can be returned by a single query
// Query duration must not exceed 10 seconds
// function isApiLimitExceeded(start, end) {
//   return (
//     end > start &&
//     end - start > LIMIT_BLOCK_MIN &&
//     end - start > LIMIT_BLOCK_MAX
//   );
// }
