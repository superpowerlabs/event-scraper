const Sql = require("../db/Sql");
const Case = require("case");
const { table } = require("console");

let dbw;
let dbr;

class DbManager extends Sql {
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
    await (await this.sql()).schema.dropTableIfExists("syn_city_passes_transfer");
    await (await this.sql()).schema.dropTableIfExists("syn_city_passes_approval");
    await (await this.sql()).schema.dropTableIfExists("syn_city_coupons_transfer");
    // TODO complete it
  }

  async table(tablename) {
    if (!(await dbr.schema.hasTable(tablename))) {
      return false;
    }
    return true;
  }

  async updateEvents(rows, event, contractName, chunkSize = 100) {
    let tablename = Case.capital(contractName, "_");
    tablename = `${tablename}_${event}`.toLowerCase();
    console.log("inserting into", tablename);
    return dbr.batchInsert(tablename, rows, chunkSize).catch(function (error) {
      console.error("failed to insert transactions", error);
      return error;
    });
  }

  async latestEvent(contractName, eventName) {
    let event = false;
    let tablename = Case.capital(contractName, "_");
    tablename = `${tablename}_${eventName}`.toLowerCase();
    const exist = await this.table(tablename);
    if (exist) {
      event = dbr.select("*").from(tablename).orderBy("block_number", "desc").first();
    }
    return event;
  }

  async getEvent(contractName, eventName, obj) {
    let event = false;
    let tablename = Case.capital(contractName, "_");
    tablename = `${tablename}_${eventName}`.toLowerCase();
    const exist = await this.table(tablename);
    if (exist) {
      event = dbr.select("*").from(tablename).where(obj);
    }
    return event;
  }
}

let dbManager;
if (!dbManager) {
  dbManager = new DbManager();
  dbManager.init();
}
module.exports = dbManager;
