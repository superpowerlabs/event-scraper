require("dotenv").config();
const migrateEvents = require("./src/migrateEvents");
const eventScraper = require("./src/lib/eventScraper");

const options = {
  // verbose: true,
  // dryrun: true,
};

async function main() {
  await migrateEvents();
  await eventScraper(options);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
