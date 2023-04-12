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

function clone(obj, options) {
  const contract = obj.contract;
  delete obj.contract;
  obj = Object.assign(JSON.parse(JSON.stringify(obj)), options, {
    contract,
  });
  return obj;
}

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

async function getMoralisEvents(options) {
  let { filter, contractName, eventConfig, filterName } = options;
  let logs;
  let offset = 0;
  let topic = web3.utils.keccak256(options.filterName);
  let limit = 500;
  do {
    const response = await requestHandler(
      Moralis.EvmApi.events.getContractEvents({
        chain: "0x" + options.eventConfig.chainId.toString(16),
        address: options.contract.address,
        limit,
        offset,
        topic,
        abi: options.eventConfig.ABI[0],
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

async function getInfuraEvents(options) {
  let {
    contract,
    filter,
    startBlock,
    endBlock,
    contractName,
    eventConfig,
    filterName,
  } = options;
  log(
    `=> Getting all events emitted by ${contractName}: ${startBlock}< block <${endBlock}`
  );
  let response = [];
  try {
    response = await requestHandler(
      contract.queryFilter(filter, startBlock, endBlock, contractName)
    );
  } catch (error) {
    let message = (
      error.error ||
      error.message ||
      JSON.parse(error.body)
    ).toString();
    if (/try with this block range/i.test(message)) {
      // error coming from Infura
      const [start, end] = message
        .split("[")[1]
        .split("]")[0]
        .split(", ")
        .map((e) => parseInt(e, 16));
      await getEventsByFilter(
        clone(options, {
          startBlock: start,
          endBlock: end,
        })
      );
      await getEventsByFilter(
        clone(options, {
          startBlock: end + 1,
        })
      );
      log(` ! API error, splitting request to void limit and timeout`);
    } else {
      console.error("Infura", error.error);
    }
  }
  if (response.length > 0) {
    const txs = await processEvents(
      response,
      filter,
      contractName,
      eventConfig
    );
    log(`Inserting ${txs.length} rows ${nameTable(contractName, filterName)}`);
    await eventManager.updateEvents(txs, filterName, contractName);
  }
}

async function getEventsByFilter(options) {
  const { eventConfig } = options;
  if (eventConfig.chainId === 1) {
    return await getInfuraEvents(options);
  } else {
    return await getMoralisEvents(options);
  }
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

async function getStartBlock(contractName, filter, startBlock) {
  const latestEvent = await eventManager.latestEvent(contractName, filter);
  if (latestEvent && latestEvent.block_number > startBlock) {
    return latestEvent.block_number + 1;
  } else {
    return startBlock;
  }
}

async function getEventInfo(contractName, eventConfig, getStarted) {
  log(
    `Getting ${getStarted ? "initial " : ""}"${
      eventConfig.name
    }" events from "${contractName}"`
  );
  const { chainId, startBlock: initialStartBlock } =
    eventsByContract[contractName];
  eventConfig.chainId = chainId;
  const { name, filter: filterName, ABI } = eventConfig;
  const startBlock = await getStartBlock(
    contractName,
    filterName,
    initialStartBlock
  );
  const provider = providers[chainId];
  const contract = new ethers.Contract(
    contracts[chainId][contractName],
    ABI,
    provider
  );
  const filter = contract.filters[filterName]();
  const endBlock = await requestHandler(provider.getBlockNumber());
  const options = {
    contract,
    filter,
    startBlock,
    endBlock,
    contractName,
    eventConfig,
    filterName,
    initialStartBlock,
  };
  if (getStarted) {
    log("Launching initial event fetch");
    await getEventsByFilter(options);
  } else {
    await getFutureEvents(contract, filter, name, contractName, eventConfig);
  }
}

async function getAllInitialEvents() {
  // for (let contractName in eventsByContract) {
  const contractName = "SynCityCoupons";
  for (let eventConfig of eventsByContract[contractName].events) {
    await getEventInfo(contractName, eventConfig, true);
  }
  // }
}

async function getAllNewEvents() {
  const promises = [];
  for (let contractName in eventsByContract) {
    for (let eventConfig of eventsByContract[contractName].events) {
      await getEventInfo(contractName, eventConfig);
    }
  }
  return Promise.all(promises);
}

async function main(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }
  await Moralis.start({
    apiKey: process.env.MORALIS,
  });

  await getAllInitialEvents();
  await getAllNewEvents();
}

module.exports = main;
