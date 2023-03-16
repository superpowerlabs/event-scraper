require("dotenv").config();
const debug = require("./db/debug");
const json = require("./config/events.json");
const Sql = require("./db/Sql");
const Case = require("case");
const utils = require("./utils");
const migrate = require("./db/migrations/migrate");
const eventManager = require("./lib/EventsManager");

async function migrateEvent(tablename, params, sql) {
  let array = ["transaction_hash", "block_number"];
  return sql.schema.createTable(tablename, (table) => {
    table.increments("id").primary();
    table.string("transaction_hash");
    table.integer("block_number");
    table.timestamp("created_at").defaultTo(sql.fn.now());
    for (const param of params) {
      let paramName = Case.snake(param.name);
      if (param.indexed) {
        table[param.type](paramName).index();
        array.push(paramName);
      } else {
        table[param.type](paramName);
        array.push(paramName);
      }
    }
    table.unique(array);
  });
}

async function migrateEvents() {
  await migrate();

  let sql = new Sql();
  sql = await sql.sql();

  for (const contract of json) {
    for (const event of contract.events) {
      const params = event.params;
      let tablename = utils.nameTable(contract.contractName, event.name);
      if (!(await sql.schema.hasTable(tablename))) {
        await migrateEvent(tablename, params, sql);
        debug(`table ${tablename} created`);
      }
    }
  }
}

module.exports = {
  migrateEvents,
  migrateEvent,
};
