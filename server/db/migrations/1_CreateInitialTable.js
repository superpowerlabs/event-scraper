const debug = require("../debug");

class CreateInitialTables extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("volume");

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

    if (!(await sql.schema.hasTable("farms"))) {
      await sql.schema.createTable("farms", (table) => {
        table.integer("token_id").primary();
        table.string("name");
        table.integer("image");
        table.integer("quality");
        table.integer("type");
        table.integer("level");
        table.integer("cfg_id");
        table.integer("feature");
        table.integer("area");
        table.integer("visual");
        table.integer("style");
        table.integer("billboard");
        table.integer("greenhouse_amount");
        table.integer("plant_time");
        table.integer("seed_consumption");
        table.integer("weed_production");
        table.integer("max_storage");
        table.integer("claimable_storage");
        table.integer("defender_attributes_bonus");
        table.integer("max_h_p");
        table.integer("current_h_p");
        table.integer("farm_state");
        // add all the attributes of the farm
      });
      done = true;
      debug('Table "farms" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateInitialTables;
