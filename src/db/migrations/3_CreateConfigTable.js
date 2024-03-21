const debug = require("../debug");

class CreateConfigTable extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (!(await sql.schema.hasTable("scraper_config"))) {
      await sql.schema.createTable("scraper_config", async (table) => {
        table.increments("id").primary();
        table.string("name").notNullable().unique();
        table.string("address").notNullable().unique();
        table.integer("chain_id").notNullable();
        table.integer("start_block").notNullable();
        table.bool("started");
        table.json("events");
        table.timestamp("created_at").defaultTo(sql.fn.now());
      });
      done = true;
      debug('Table "scraper_config" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateConfigTable;
