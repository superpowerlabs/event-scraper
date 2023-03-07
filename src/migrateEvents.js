require("dotenv").config();
const debug = require("./db/debug");
const json = require("./config/events.json");
const Sql = require("./db/Sql");
const Case = require("Case");
const migrate = require("./db/migrations/migrate");

async function migrateEvent(tablename, params, sql) {
  await sql.schema.createTable(tablename, (table) => {
    table.string("transaction_hash").unique();
    table.integer("block_number");
    table.timestamp("created_at").defaultTo(sql.fn.now());
    for (const param of params) {
      if (param.indexed) {
        table[param.type](param.name.toLowerCase()).index();
      } else {
        table[param.type](param.name.toLowerCase());
      }
    }
  });
  return;
}

async function migrateEvents() {
  await migrate();

  let sql = new Sql();
  sql = await sql.sql();

  for (const contract of json) {
    for (const event of contract.events) {
      const params = event.params;
      let tablename = Case.capital(contract.contractName, "_");
      tablename = `${tablename}_${event.name}`.toLowerCase();
      if (!(await sql.schema.hasTable(tablename))) {
        migrateEvent(tablename, params, sql);
        debug(`table ${tablename} created`);
      }
    }
  }
}

module.exports = {
  migrateEvents,
  migrateEvent,
};
