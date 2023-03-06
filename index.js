require("dotenv").config();
const migrate = require("./src/db/migrations/migrate");
const eventScraper = require("./src/lib/eventScraper");

async function main() {
  await migrate();
  const options = {
    verbose: true,
    dryrun: true,
  };
  await eventScraper(options);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
