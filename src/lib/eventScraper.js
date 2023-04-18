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
} = require("../config");
const { nameTable } = require("../utils");
const requestHandler = require("./requestHandler");

let failedEvents = [];
let options = {};

function log(...params) {
  if (options.verbose) {
    console.debug(...params);
  }
}

async function retrieveHistoricalEvents(params) {
  let { filter, contractName, eventConfig, filterName, contract } = params;
  let logs;
  let topic = ethers.utils.id(params.filterName);
  const count = options.force
    ? 0
    : await eventManager.countEvents(contractName, filterName);
  let recoverHours = options.hours || 12;
  let recoverOffset = Math.round(
    (averageBlockPerDay[eventConfig.chainId] * recoverHours) / 24
  );
  let offset = count > recoverOffset ? count - recoverOffset : count;
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
    console.info(
      `Inserting ${txs.length} rows into ${nameTable(contractName, filterName)}`
    );
    await eventManager.updateEvents(txs, eventName, contractName);
  });
}

async function processSingleEvent(event, filter, argNames, argTypes) {
  let tx;
  const { transaction_hash, block_number, block_timestamp } = event;
  try {
    tx = {
      transaction_hash,
      block_number,
      block_timestamp,
    };
    for (let i = 0; i < argNames.length; i++) {
      const arg = argNames[i];
      const type = argTypes[i];
      const dataArg = Case.snake(arg);
      switch (type) {
        case "uint256":
          tx[dataArg] = event.data[arg].toString();
          break;
        case "boolean":
          tx[dataArg] =
            (typeof event.data[arg] === "boolean" && event.data[arg]) ||
            /true/i.test(event.data[arg])
              ? "TRUE"
              : "FALSE";
          break;
        default:
          tx[dataArg] = event.data[arg];
      }
    }
  } catch (error) {
    // this should never happen
    // TODO if happens, we should log the failed events on file
    failedEvents.push({ event: event, type: filter });
    console.error(error.message);
  }
  return tx;
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

async function eventScraper(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
  if (options.scope === "historical") {
    // called by `scraper.js`
    // retrieve historical events using Moralis API
    for (let contractName in eventsByContract) {
      if (!options.contract || contractName === options.contract) {
        for (let eventConfig of eventsByContract[contractName].events) {
          if (!options.event || eventConfig.name === options.event) {
            await getEventInfo(contractName, eventConfig, true);
          }
        }
      }
    }
  } else if (options.scope === "realtime") {
    // called by `monitor.js`
    // monitor future events using Infura and BSCRPC API
    const promises = [];
    for (let contractName in eventsByContract) {
      for (let eventConfig of eventsByContract[contractName].events) {
        promises.push(getEventInfo(contractName, eventConfig));
      }
    }
    return Promise.all(promises);
  } else {
    // uhm...
    console.error("Unknown scope");
  }
}

module.exports = eventScraper;
