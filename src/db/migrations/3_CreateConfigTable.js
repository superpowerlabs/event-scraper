const debug = require("../debug");

class CreateConfigTable extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (!(await sql.schema.hasTable("event_scraper_config"))) {
      await sql.schema.createTable("event_scraper_config", async (table) => {
        table.increments("id").primary();
        table.string("name").notNullable().unique();
        table.string("address").notNullable();
        table.integer("chain_id").notNullable();
        table.integer("start_block").defaultTo(0);
        table.bool("started");
        table.text("events");
        table.string("version").defaultTo("");
        table.timestamp("created_at").defaultTo(sql.fn.now());
      });
      done = true;
      debug('Table "event_scraper_config" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateConfigTable;
