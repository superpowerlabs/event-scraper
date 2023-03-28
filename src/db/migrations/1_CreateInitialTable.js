const debug = require("../debug");

class CreateInitialTables extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (!(await sql.schema.hasTable("test"))) {
      await sql.schema.createTable("test", async (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.timestamp("created_at").defaultTo(sql.fn.now());
      });
      done = true;
      debug('Table "test" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateInitialTables;
