require("dotenv").config();
const Case = require("case");
const ethers = require("ethers");
const eventManager = require("./EventManager");
// const Moralis = require("moralis").default;
// const Web3 = require("web3");
// const web3 = new Web3();
// const _ = require("lodash");

const {
  providers,
  eventsByContract,
  contracts,
  blocksPerHour,
} = require("../config");
const { nameTable, sleep } = require("../utils");
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

async function midPoint(start, end, initialStartBlock, chainId) {
  // const blocks = blocksPerHour[chainId];
  // if (start === initialStartBlock) {
  //   return start + blocks * 2;
  // } else if (start === initialStartBlock + blocks * 2) {
  //   return start + blocks * 4;
  // } else if (start === initialStartBlock + blocks * 6) {
  //   return start + blocks * 12;
  // } else if (start === initialStartBlock + blocks * 18) {
  //   return start + blocks * 48;
  // } else {
  return Math.floor((start + end) / 2);
  // }
}

//
// function decodeLogs(abi, contractAddress, logs) {
//   // Create a Contract instance
//   const contract = new web3.eth.Contract(abi, contractAddress);
//
//   // Iterate through the logs and decode each event
//   return _.compact(
//     logs.map((log) => {
//       const eventSignature = log.topics[0];
//       const eventAbi = abi.find(
//         (item) =>
//           item.type === "event" &&
//           web3.utils.keccak256(item.signature) === eventSignature
//       );
//
//       if (!eventAbi) {
//         // console.warn("Unknown event with signature:", eventSignature);
//         return null;
//       }
//
//       const decodedLog = web3.eth.abi.decodeLog(
//         eventAbi.inputs,
//         log.data,
//         log.topics.slice(1)
//       );
//
//       // console.log("decodedLog", decodedLog);
//
//       return {
//         eventName: eventAbi.name,
//         ...decodedLog,
//       };
//     })
//   );
// }
//
// async function getAllLogs(options) {
//   //
//   // const limit = 100; // The maximum number of results per request (max 1000)
//   // let skip = 0; // The number of results to skip
//   let allLogs = [];
//   // let moreResults = true;
//   //
//   // while (moreResults) {
//   //   const response = await Moralis.EvmApi.events.getContractLogs({
//   //     cursor: skip,
//   //     limit: limit,
//   //   });
//   //
//   //   allLogs = allLogs.concat(response.result);
//   //
//   //   if (response.result.length < limit) {
//   //     // If the response contains less than the limit, there are no more results to fetch
//   //     moreResults = false;
//   //   } else {
//   //     // Otherwise, update the skip parameter for the next iteration
//   //     skip += limit;
//   //   }
//   // }
//
//   let cursor = undefined;
//   let owners = {};
//   do {
//     const response = await Moralis.EvmApi.events.getContractLogs({
//       chain: "0x" + options.eventConfig.chainId.toString(16),
//       address: options.contract.address,
//       limit: 100,
//       cursor: cursor,
//     });
//     // console.log(response.result[0])
//     // process.exit();
//
//     let logs = response.result.map((e) => e._value);
//
//     logs = decodeLogs(options.eventConfig.ABI, options.contract.address, logs);
//     // console.log(logs[0])
//     // allLogs = allLogs.concat(response.result.map(e => e._value));
//     // console.log(allLogs[0]);
//     // process.exit()
//
//     // console.log(
//     //     `Got page ${response.page} of ${Math.ceil(
//     //         response.total / response.page_size
//     //     )}, ${response.total} total`
//     // );
//     // for (const owner of response.result) {
//     //   owners[owner.owner_of] = {
//     //     amount: owner.amount,
//     //     owner: owner.owner_of,
//     //     tokenId: owner.token_id,
//     //     tokenAddress: owner.token_address,
//     //   };
//     // }
//     cursor = response.cursor;
//   } while (cursor !== "" && cursor != null);
//   return allLogs;
// }

async function getEventsByFilter(options) {
  let {
    contract,
    filter,
    startBlock,
    endBlock,
    contractName,
    eventConfig,
    filterName,
    initialStartBlock,
  } = options;
  //
  // console.log(filter,
  //     startBlock,
  //     endBlock,
  //     contractName,
  //     eventConfig,
  //     filterName,
  //     initialStartBlock);

  log(
    `=> Getting all events emitted by ${contractName}: ${startBlock}< block <${endBlock}`
  );
  let response = [];
  try {
    // if (eventConfig.chainId === 1) {
    response = await requestHandler(
      contract.queryFilter(filter, startBlock, endBlock, contractName)
    );
    // } else {
    //   response = await getAllLogs(options);
    // }
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
      //if (/block range is too wide/i.test(message)) {
      console.log("error", error);
      const mid = await midPoint(
        startBlock,
        endBlock,
        initialStartBlock,
        eventConfig.chainId
      );
      console.log(startBlock, mid, endBlock);
      await sleep(100);
      // await getEventsByFilter(clone(options, { endBlock: mid }));
      await getEventsByFilter(clone(options, { startBlock: mid + 1 }));
    }
  }

  console.log(response);

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
          tx[dataArg] =
            (typeof event.args[arg] === "boolean" && event.args[arg]) ||
            /true/i.test(event.args[arg])
              ? "TRUE"
              : "FALSE";
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
  // await Moralis.start({
  //   apiKey: process.env.MORALIS,
  // });

  await getAllInitialEvents();
  // await getAllNewEvents();
}

module.exports = main;
