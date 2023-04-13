#!/usr/bin/env node

const commandLineArgs = require("command-line-args");
const eventScraper = require("./src/lib/eventScraper");
const { migrateEvents } = require("./src/migrateEvents");

const optionDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
  },
  {
    name: "verbose",
    alias: "v",
    type: Boolean,
  },
  {
    name: "dryrun",
    alias: "d",
    type: Boolean,
    defaultValue: false,
  },
  {
    name: "types",
    alias: "t",
    type: String,
    defaultValue: "Staked,Unstaked,YieldClaimed",
  },
  {
    name: "contract",
    alias: "c",
    type: String,
  },
  {
    name: "event",
    alias: "e",
    type: String,
  },
  {
    name: "force",
    alias: "f",
    type: Boolean,
  },
];

function error(message) {
  if (!Array.isArray(message)) {
    message = [message];
  }
  console.error(message[0]);
  if (message[1]) {
    console.info(message[1]);
  }
  /*eslint-disable-next-line*/
  process.exit(1);
}

let options = {};
try {
  options = commandLineArgs(optionDefinitions, {
    camelCase: true,
  });
} catch (e) {
  error(e.message);
}

if (options.help) {
  console.info(`SYNR Volume Service

Options:
  -h, --help      This help.
  -v, --verbose   Shows all the console logs
  -d, --dryrun    Don't persiste transactions to the database
  -t, --types     A comma seperated string o type of event to get (for example "Staked, Unstaked, YieldClaimed")
  -c, --contract  The contract to get events from
  -e, --event     The event to retrieve
  -f, --force     Force the retrieve of all the events from deployment time
`);
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

async function main() {
  await migrateEvents();
  // exit after the first run without starting the monitoring
  options.exit = true;
  await eventScraper(options);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
