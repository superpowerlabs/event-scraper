const knex = require("knex");
const Sql = require("../db/Sql");

let dbw;
let dbr;

class Transactions extends Sql {
  async init() {
    dbw = await this.sql();
    dbr = await this.sql(true); // read only
    this.initiated = true;
  }

  // for testing
  async resetTableIfTesting() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("This can be used only for testing");
    }
    await (await this.sql()).schema.dropTableIfExists("transactions");
  }

  async all() {
    return dbr.select("*").from("transactions").orderBy("timestamp", "desc");
  }

  async save(rows) {
    await dbw("transactions").insert(rows);
  }

  async batchInsert(rows, chunkSize = 100) {
    return dbr
      .batchInsert("transactions", rows, chunkSize)
      .catch(function (error) {
        console.error("failed to insert transactions", error);
      });
  }

  //
  // returns the latest transaction
  // if etype is provided, returns the latest transaction of that type
  //
  async latest(etype) {
    let res;
    if (etype) {
      res = await dbr
        .select("*")
        .from("transactions")
        .where("etype", etype)
        .orderBy("timestamp", "desc")
        .limit(1);
    } else {
      res = await dbr
        .select("*")
        .from("transactions")
        .orderBy("timestamp", "desc")
        .limit(1);
    }
    return res.length === 0 ? null : res[0];
  }

  //
  // TODO: add where clause for types
  // !! this current implementation aggregates all types in the db wo using the types argument
  //
  async aggregate(types) {
    const query = `
      with daily_volumes as (select date_trunc('day', to_timestamp(timestamp)) as day, sum(amount) from transactions group by 1)
      select day, sum(sum) over (order by day asc) from daily_volumes;
      `;
    return await dbr.raw(query).then((response) => {
      let volumes = [];
      for (let row of response.rows) {
        volumes.push([row.day.getTime(), parseInt(row.sum)]);
      }
      return volumes;
    });
  }

  async aggregate_one_type(etype) {
    const query = `
      with daily_volumes as (select date_trunc('day', to_timestamp(timestamp)) as day, sum(amount) from transactions where etype = '${etype}' group by 1)
      select day, sum(sum) over (order by day asc) from daily_volumes;
      `;
    return await dbr.raw(query).then((response) => {
      let volumes = [];
      for (let row of response.rows) {
        volumes.push([row.day.getTime(), parseInt(row.sum)]);
      }
      return volumes;
    });
  }

  async volumes(bytype = false) {
    let volumes = [];
    let types = ["Staked", "Unstaked", "YieldClaimed"];
    if (bytype) {
      for (let type of types) {
        let data = await this.aggregate_one_type(type);
        volumes.push({ name: type, data: data });
      }
    } else {
      volumes = await this.aggregate(types);
    }
    return volumes;
  }
}

let transactions;
if (!transactions) {
  transactions = new Transactions();
}
module.exports = transactions;
