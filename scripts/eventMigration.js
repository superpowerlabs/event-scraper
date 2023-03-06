const debug = require("../server/db/debug");

class CreateInitialTables extends require("../server/db/Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("turfs"))) {
      await sql.schema.createTable("turfs", (table) => {
        table.integer("token_id").primary();
        table.string("name");
        table.integer("image");
        table.integer("cfg_id");
        table.integer("width");
        table.integer("height");
        table.integer("total_used_area");
        table.integer("level");
        table.integer("building_permission");
        table.integer("location");
        table.integer("coord_x");
        table.integer("coord_y");
        table.integer("controller");
        table.integer("topography");
        table.integer("logo");
        // add all the attributes of a turf
      });
      done = true;
      debug('Table "turfs" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateInitialTables;
