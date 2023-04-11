require("dotenv").config();
const debug = require("./db/debug");
const eventsByContract = require("./config/eventsByContract.js");
const Sql = require("./db/Sql");
const Case = require("case");
const utils = require("./utils");
const migrate = require("./db/migrations/migrate");
const { typeMapping } = require("./config");

async function migrateEvent(tableName, params, dbw) {
  let array = ["transaction_hash", "block_number"];
  return dbw.schema.createTable(tableName, (table) => {
    table.increments("primary_key").primary();
    table.string("transaction_hash");
    table.integer("block_number").index();
    table.timestamp("created_at").defaultTo(dbw.fn.now());
    for (const param of params) {
      let paramName = Case.snake(param.name);
      let paramType = typeMapping[param.type];
      if (param.indexed) {
        table.specificType(paramName, paramType).index();
        array.push(paramName);
      } else {
        table.specificType(paramName, paramType);
        array.push(paramName);
      }
    }
    table.unique(array, `${tableName}_unique`);
  });
}

async function migrateEvents() {
  await migrate();

  const sql = new Sql();
  const dbw = await sql.sql();
  // await dbw.schema.dropTableIfExists("syn_city_coupons__transfer__aau");

  for (const contractName in eventsByContract) {
    for (const event of eventsByContract[contractName].events) {
      const params = event.ABI[0].inputs;
      let tableName = utils.nameTable(contractName, event.filter);
      // await dbw.schema.dropTableIfExists(tableName);
      if (!(await dbw.schema.hasTable(tableName))) {
        await migrateEvent(tableName, params, dbw);
        debug(`table ${tableName} created`);
      }
    }
  }
}

module.exports = {
  migrateEvents,
};
