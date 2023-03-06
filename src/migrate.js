require("dotenv").config();
const migrate = require("./db/migrations/migrate");

async function migrate(callback) {
  await migrate();
  await callback();
}

module.exports = migrate;
