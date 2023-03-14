require("dotenv").config();
const debug = require("./db/debug");
const json = require("./config/events.json");
const Sql = require("./db/Sql");
const Case = require("case");
const migrate = require("./db/migrations/migrate");

async function migrateEvent(tablename, params, sql) {
  let array = ["transaction_hash", "block_number"];
  await sql.schema.createTable(tablename, (table) => {
    table.string("transaction_hash");
    table.integer("block_number");
    table.timestamp("created_at").defaultTo(sql.fn.now());
    for (const param of params) {
      if (param.indexed) {
        table[param.type](Case.snake(param.name)).index();
        array.push(Case.snake(param.name));
      } else {
        table[param.type](Case.snake(param.name));
        array.push(Case.snake(param.name));
      }
    }
    table.unique(array);
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
