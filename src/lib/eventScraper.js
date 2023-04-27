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
      fromBlock = latestEventBlock - (options.blocks || 0);
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
    await eventManager.updateEvents(txs, filterName, contractName);
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

async function processRPCEvent(event, filter, argNames, argTypes) {
  let tx;
  const { transactionHash, blockTimestamp, blockNumber } = event;
  try {
    tx = {
      transactionHash,
      blockTimestamp,
      blockNumber,
    };
    for (let i = 0; i < argNames.length; i++) {
      const dataArg = Case.snake(argNames[i]);
      tx[dataArg] = formatAttribute(argNames, argTypes, event.args);
    }
  } catch (error) {
    // this should never happen
    logFailedEvent(event, filter, error);
  }
  return tx;
}

function logFailedEvent(event, filter, error) {
  console.error("Failed to process event with filter", filter);
  console.error(JSON.stringify(event));
  console.error(error.message);
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
  testEventMonitoring().then();
  console.log("returned");
  return;

  if (opt) {
    options = Object.assign(options, opt);
  }
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });
  const promises = [];
  for (let contractName in eventsByContract) {
    if (!options.contract || contractName === options.contract) {
      for (let eventConfig of eventsByContract[contractName].events) {
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
    return new Promise(() => {});
  }
}

module.exports = eventScraper;

async function testEventMonitoring() {
  const chainId = 1;
  const address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const ABI = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
  ];

  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_KEY);
  const contract = new ethers.Contract(address, ABI, provider);

  contract
    .on("Transfer", (from, to, value, event) => {
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Value: ${value.toString()}`);
      console.log(event);
    })
    .on("error", console.error);

  return new Promise(() => {});
}
