const debug = require("../debug");

class CreateHistory extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("turfs_history"))) {
      await sql.schema.createTable("turfs_history", (table) => {
        table.timestamp("changed_at");
        table.integer("token_id");
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
      debug('Table "turfs_history" created.');
    }

    if (!(await sql.schema.hasTable("farms_history"))) {
      await sql.schema.createTable("farms_history", (table) => {
        table.timestamp("changed_at");
        table.integer("token_id");
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
      debug('Table "farms_history" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateHistory;
