require("dotenv").config();
const migrate = require("./db/migrations/migrate");

async function migrateEvents() {
  await migrate();

  // the script to create the dynamic migrations
}

module.exports = migrateEvents;
