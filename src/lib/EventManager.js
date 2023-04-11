const Sql = require("../db/Sql");
const Case = require("case");
const utils = require("../utils");
const json = require("../config/eventsByContract.js");

let dbw;
let dbr;

class EventManager extends Sql {
  // for reference
  // https://knexjs.org

  async init() {
    dbw = await this.sql();
    dbr = await this.sql(true); // read only
    this.initiated = true;
  }

  async resetDbIfTesting() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("This can be used only for testing");
    }
    for (const contract of json) {
      for (const event of contract.events) {
        let tableName = utils.nameTable(contract.contractName, event.name);
        await dbw.schema.dropTableIfExists(tableName);
      }
    }
    // TODO complete it
  }

  async tableExists(tableName) {
    if (!(await dbr.schema.hasTable(tableName))) {
      return false;
    }
    return true;
  }

  async updateEvents(rows, event, contractName, chunkSize = 100) {
    let tableName = utils.nameTable(contractName, event);
    // console.log("inserting into", tableName);
    return dbw.batchInsert(tableName, rows, chunkSize).catch(function (error) {
      console.error("failed to insert transactions", error);
      return error;
    });
  }

  async latestEvent(contractName, eventName) {
    let event = false;
    let tableName = utils.nameTable(contractName, eventName);
    const exist = await this.tableExists(tableName);
    if (exist) {
      event = dbr
        .select("*")
        .from(tableName)
        .orderBy("block_number", "desc")
        .first();
    }
    return event;
  }

  // used in testing
  async getEvent(contractName, eventName, obj) {
    let event = false;
    let tableName = Case.capital(contractName, "_");
    tableName = `${tableName}_${eventName}`.toLowerCase();
    const exist = await this.tableExists(tableName);
    if (exist) {
      event = dbr.select("*").from(tableName).where(obj);
    }
    return event;
  }
}

let eventManager;
if (!eventManager) {
  eventManager = new EventManager();
  eventManager.init();
}
module.exports = eventManager;
