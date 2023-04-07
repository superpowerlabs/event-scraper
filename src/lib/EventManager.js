const Sql = require("../db/Sql");
const Case = require("case");
const utils = require("../utils");
const json = require("../config/events.js");

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
        let tablename = utils.nameTable(contract.contractName, event.name);
        await dbw.schema.dropTableIfExists(tablename);
      }
    }
    // TODO complete it
  }

  async tableExists(tablename) {
    if (!(await dbr.schema.hasTable(tablename))) {
      return false;
    }
    return true;
  }

  async updateEvents(rows, event, contractName, chunkSize = 100) {
    let tablename = utils.nameTable(contractName, event);
    console.log("inserting into", tablename);
    return dbw.batchInsert(tablename, rows, chunkSize).catch(function (error) {
      console.error("failed to insert transactions", error);
      return error;
    });
  }

  async latestEvent(contractName, eventName) {
    let event = false;
    let tablename = utils.nameTable(contractName, eventName);
    const exist = await this.tableExists(tablename);
    if (exist) {
      event = dbr.select("*").from(tablename).orderBy("block_number", "desc").first();
    }
    return event;
  }

  // used in testing
  async getEvent(contractName, eventName, obj) {
    let event = false;
    let tablename = Case.capital(contractName, "_");
    tablename = `${tablename}_${eventName}`.toLowerCase();
    const exist = await this.tableExists(tablename);
    if (exist) {
      event = dbr.select("*").from(tablename).where(obj);
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
