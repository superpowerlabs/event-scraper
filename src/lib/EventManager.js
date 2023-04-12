const Sql = require("../db/Sql");
const Case = require("case");
const utils = require("../utils");
const eventsByContract = require("../config/eventsByContract.js");

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
    for (const contract in eventsByContract) {
      for (const event of eventsByContract[contract].events) {
        let tableName = utils.nameTable(contract, event.filter);
        await dbw.schema.dropTableIfExists(tableName);
      }
    }
    // TODO complete it
  }

  async tableExists(tableName) {
    return await dbr.schema.hasTable(tableName);
  }

  createBatchInsertQuery(tableName, rows) {
    const columns = Object.keys(rows[0])
      .map((col) => `"${col}"`)
      .join(", ");
    const values = rows
      .map(
        (row) =>
          "(" +
          Object.values(row)
            .map((value) => (typeof value === "string" ? `'${value}'` : value))
            .join(", ") +
          ")"
      )
      .join(", ");
    return `INSERT INTO "${tableName}" (${columns}) VALUES ${values} ON CONFLICT (${columns}) DO NOTHING;`;
  }

  async updateEvents(rows, filter, contractName, chunkSize = 100) {
    let tableName = utils.nameTable(contractName, filter);
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const sql = this.createBatchInsertQuery(tableName, chunk);
      try {
        await dbw.raw(sql);
      } catch (error) {
        console.error("failed to insert transactions", error);
        return error;
      }
    }
  }

  async latestEvent(contractName, filter) {
    let event = false;
    let tableName = utils.nameTable(contractName, filter);
    const exist = await this.tableExists(tableName);
    if (exist) {
      event = dbr(tableName).max("block_number as block_number").first();
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
