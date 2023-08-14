const commandLineArgs = require("command-line-args");
const pkg = require("./package.json");
const _ = require("lodash");
const { migrateEvents } = require("./src/migrateEvents");
const gameExports = require("./src/lib/GameExports");
require("dotenv").config();

const optionDefinitions = [
  {
    name: "help",
    alias: "h",
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
Minted Column Checker V${pkg.version}

Options:
  -h, --help    This help.
  -t, --table   The table to check for the 'minted' column (required)
`);
  process.exit(0);
}

async function main() {
  await migrateEvents();
  if (typeof options.verbose === "undefined") {
    options.verbose = true;
  }
  options.scope = "historical";

  const keysToUpdate = [2, 4, 5, 7];
  await gameExports.checkGameExport(keysToUpdate);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
