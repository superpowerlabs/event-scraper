const debug = require("../debug");

class CreateTransactions extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("transactions");

    if (!(await sql.schema.hasTable("transactions"))) {
      await sql.schema.createTable("transactions", (table) => {
        table.bigint("amount");
        table.bigint("block");
        table.string("hash");
        table.string("etype");
        table.bigint("timestamp");
        table.unique(["hash", "etype"]);
      });
      done = true;
      debug('Table "Transactions" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateTransactions;
