require("dotenv").config();
const { migrateEvents } = require("./src/migrateEvents");
const eventScraper = require("./src/lib/eventScraper");
const commandLineArgs = require("command-line-args");
const pkg = require("./package.json");

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
    name: "contract",
    alias: "c",
    type: String,
  },
  {
    name: "event",
    alias: "e",
    type: String,
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
  console.info(`
Event Scraper V${pkg.version}

Options:
  -h, --help      This help.
  -v, --verbose   Shows all the console logs. Default TRUE
  -c, --contract  The contract to get events from
  -e, --event     The event to retrieve
`);
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

async function main() {
  await migrateEvents();
  options.scope = "realtime";
  await eventScraper(options);
}

main().then();
