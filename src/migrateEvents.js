require("dotenv").config();
const debug = require("./db/debug");
const Sql = require("./db/Sql");
const Case = require("case");
const utils = require("./utils");
const migrate = require("./db/migrations/migrate");
const { eventsByContract, typeMapping } = require("./config");
const json = require("./config/deployedProduction.json");

async function migrateEvent(tableName, params, dbw) {
  let array = ["transaction_hash", "block_number", "block_timestamp"];
  return dbw.schema.createTable(tableName, (table) => {
    table.increments("primary_key").primary();
    table.string("transaction_hash");
    table.integer("block_number").index();
    table.timestamp("created_at").defaultTo(dbw.fn.now());
    table.timestamp("block_timestamp").index();
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
  const sql = new Sql();
  const dbw = await sql.sql();
  // await dbw.schema.dropTableIfExists("syn_city_coupons__transfer__aau");

  for (const contractName in eventsByContract) {
    for (const event of eventsByContract[contractName].events) {
      const params = event.ABI[0].inputs;
      let tableName = utils.nameTable(contractName, event.filter);
      // console.log(tableName);
      // await dbw.schema.dropTableIfExists(tableName);
      if (!(await dbw.schema.hasTable(tableName))) {
        await migrateEvent(tableName, params, dbw);
        debug(`table ${tableName} created`);
      }
    }
  }
}

async function migrateContracts() {
  debug("Migrating contract");

  const sql = new Sql();
  const dbw = await sql.sql();
  // await dbw.schema.dropTableIfExists("syn_city_coupons__transfer__aau");

  if (await dbw.schema.hasTable("current_address")) {
    for (let events in eventsByContract) {
      let chainId = eventsByContract[events].chainId;
      let address = json[chainId][events];
      const existingEntry = await dbw("current_address").where({ name: events }).first();
      if (existingEntry) {
        if (existingEntry.address !== address) {
          await dbw("current_address").where({ name: events }).update({ address: address });
          console.log(`Updated address for ${events} to ${address}.`);
        }
      } else {
        await dbw("current_address").insert({
          name: events,
          address: address,
        });
      }
    }
  }
}

module.exports = {
  migrateEvents,
  migrateContracts,
};
