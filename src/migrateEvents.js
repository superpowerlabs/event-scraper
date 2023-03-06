require("dotenv").config();
const migrate = require("./db/migrations/migrate");

function migrateEvent() {}

async function migrateEvents() {
  await migrate();

  // for each event in the eventTables
  // migrateEvent(eventTables)
  // the script to create the dynamic migrations
}

module.exports = {
  migrateEvents,
  migrateEvent,
};
