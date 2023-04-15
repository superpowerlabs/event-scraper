require("dotenv").config();
const { migrateEvents } = require("./src/migrateEvents");
const eventScraper = require("./src/lib/eventScraper");

// options for production
const options = {
  // verbose: true,
};

async function main() {
  await migrateEvents();
  options.scope = "realtime";
  await eventScraper(options);
}

main().then();
