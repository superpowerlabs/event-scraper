require("dotenv").config();
const { migrateEvents } = require("./src/migrateEvents");
const eventScraper = require("./src/lib/eventScraper");
const { sleep } = require("./src/utils");

let options = {
  blocks: 100000,
};

async function main() {
  await migrateEvents();
  options.scope = "historical";
  while (await eventScraper(options)) {
    // it attempts to recover missing events every 5 minutes
    await sleep(1000 * 300);
  }
}

main().then();
