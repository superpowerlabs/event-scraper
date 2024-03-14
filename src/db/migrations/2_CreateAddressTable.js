const debug = require("../debug");

class CreateAddressTables extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("current_address"))) {
      await sql.schema.createTable("current_address", async (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.string("address").notNullable();
      });
      done = true;
      debug('Table "current_address" created.');
    }
    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateAddressTables;
