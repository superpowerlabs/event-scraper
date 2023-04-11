require("dotenv").config();
const Case = require("case");
const ethers = require("ethers");
const eventManager = require("./EventManager");
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

async function midPoint(start, end) {
  // we assume that at the beginning there are a lot more events
  // and try to guess an optimal mid point (still, very arbitrary)
  return start + Math.floor((end - start) / 10);
}

async function getEventsByFilter(
  contract,
  filter,
  start,
  end,
  contractName,
  eventConfig
) {
  log(
    `=> Getting all events emitted by ${contractName}: ${start}< block <${end}`
  );
  let response = [];
  try {
    response = await requestHandler(
      contract.queryFilter(filter, start, end, contractName)
    );
  } catch (error) {
    let message = (
      error.error ||
      error.message ||
      JSON.parse(error.body)
    ).toString();
    if (/try with this block range/i.test(message)) {
      // error coming from Infura
      const range = message.split("[")[1].split("]")[0].split(", ");
      const newStart = parseInt(range[0], 16);
      const newEnd = parseInt(range[1], 16);
      await getEventsByFilter(
        contract,
        filter,
        newStart,
        newEnd,
        contractName,
        eventConfig
      );
      await getEventsByFilter(
        contract,
        filter,
        newEnd + 1,
        end,
        contractName,
        eventConfig
      );
      log(` ! API error, splitting request to void limit and timeout`);
    } else if (/block range is too wide/.test(message)) {
      // error coming from bscrpc
      const mid = await midPoint(start, end);
      await getEventsByFilter(
        contract,
        filter,
        start,
        mid,
        contractName,
        eventConfig
      );
      await getEventsByFilter(
        contract,
        filter,
        mid + 1,
        end,
        contractName,
        eventConfig
      );
    } else {
      // generic case, same as above, for now
      const mid = await midPoint(start, end);
      await getEventsByFilter(
        contract,
        filter,
        start,
        mid,
        contractName,
        eventConfig
      );
      await getEventsByFilter(
        contract,
        filter,
        mid + 1,
        end,
        contractName,
        eventConfig
      );
    }
  }
  if (response.length > 0) {
    const txs = await processEvents(
      response,
      filter,
      contractName,
      eventConfig
    );
    const eventName = response[0].event;
    log(`Inserting ${txs.length} rows ${nameTable(contractName, eventName)}`);
    await eventManager.updateEvents(txs, eventName, contractName);
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

async function processSingleEvent(event, filter, argNames, argTypes) {
  let tx;
  const { transactionHash, blockNumber } = event;
  try {
    tx = {
      transaction_hash: transactionHash,
      block_number: blockNumber,
    };
    for (let i = 0; i < argNames.length; i++) {
      const arg = argNames[i];
      const type = argTypes[i];
      const dataArg = Case.snake(arg);
      switch (type) {
        case "uint256":
          tx[dataArg] = event.args[arg].toString();
          break;
        case "boolean":
          tx[dataArg] = /true/i.test(event.args[arg]);
          break;
        default:
          tx[dataArg] = event.args[arg];
      }
    }
  } catch (error) {
    failedEvents.push({ event: event, type: filter });
    console.log(error);
  }
  return tx;
}

async function getStartBlock(contractName, eventName, startBlock) {
  const latestEvent = await eventManager.latestEvent(contractName, eventName);
  if (latestEvent) {
    return latestEvent.block_number + 1;
  } else {
    return startBlock;
  }
}

async function getEventInfo(contractName, eventConfig, getStarted) {
  console.log(
    `Getting ${getStarted ? "initial " : ""}"${
      eventConfig.name
    }" events from "${contractName}"`
  );
  let { chainId, startBlock } = eventsByContract[contractName];
  const { name, filter: filterName, ABI } = eventConfig;
  startBlock = await getStartBlock(contractName, name, startBlock);
  const provider = providers[chainId];
  const contract = new ethers.Contract(
    contracts[chainId][contractName],
    ABI,
    provider
  );
  const filter = contract.filters[filterName]();
  const endBlock = await requestHandler(provider.getBlockNumber());
  if (getStarted) {
    await getEventsByFilter(
      contract,
      filter,
      startBlock,
      endBlock,
      contractName,
      eventConfig
    );
  } else {
    await getFutureEvents(contract, filter, name, contractName, eventConfig);
  }
}

async function main(opt) {
  if (opt) {
    options = Object.assign(options, opt);
  }

  // const c = eventsByContract.SynCityPasses;
  // c.startBlock = 15000000;
  // const e = c.events[0];
  // await getEventInfo("SynCityPasses", e)
  //
  // return

  // the first iteration is serial
  for (let contractName in eventsByContract) {
    for (let eventConfig of eventsByContract[contractName].events) {
      await getEventInfo(contractName, eventConfig, true);
    }
  }

  // future iterations are parallel
  const promises = [];
  for (let contractName in eventsByContract) {
    for (let eventConfig of eventsByContract[contractName].events) {
      await getEventInfo(contractName, eventConfig);
    }
  }
  await Promise.all(promises);
}

module.exports = main;
