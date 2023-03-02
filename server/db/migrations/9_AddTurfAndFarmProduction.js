const debug = require("../debug");

class AddTurfAndFarmProduction extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("turf"))) {
      await sql.schema.createTable("turf", (t) => {
        t.integer("token_id").primary();
        t.string("name");
        t.string("quality");
        t.integer("cfg_id");
        t.integer("width");
        t.integer("height");
        t.integer("total_used_area");
        t.integer("level");
        t.integer("building_permission");
        t.integer("location");
        t.integer("coord_x");
        t.integer("coord_y");
        t.integer("controller");
        t.integer("topography");
        t.integer("logo");
        // add all the attributes of a turf
      });
      done = true;
      debug('Table "turf" created.');
    }

    if (!(await sql.schema.hasTable("farm"))) {
      await sql.schema.createTable("farm", (t) => {
        t.integer("token_id").primary();
        t.string("name");
        t.string("quality");
        t.integer("type");
        t.integer("level");
        t.integer("cfg_id");
        t.integer("feature");
        t.integer("style");
        t.integer("area");
        t.integer("visual");
        t.integer("billboard");
        t.integer("greenhouse_amount");
        t.integer("defender_attributes_bonus");
        t.integer("plant_time");
        t.integer("seed_consumption");
        t.integer("weed_production");
        t.integer("max_storage");
        t.integer("claimable_storage");
        t.integer("max_h_p");
        t.integer("current_h_p");
        t.integer("farm_state");
        // add all the attributes of the farm
      });
      done = true;
      debug('Table "farm" created.');
    }

    if (!(await sql.schema.hasTable("turf_history"))) {
      await sql.schema.createTable("turf_history", (t) => {
        t.timestamp("changed_at");
        t.integer("token_id");
        t.string("name");
        t.string("quality");
        t.integer("cfg_id");
        t.integer("width");
        t.integer("height");
        t.integer("total_used_area");
        t.integer("level");
        t.integer("building_permission");
        t.integer("location");
        t.integer("coord_x");
        t.integer("coord_y");
        t.integer("controller");
        t.integer("topography");
        t.integer("logo");
        // add all the attributes of a turf
      });
      done = true;
      debug('Table "turf_history" created.');
    }

    if (!(await sql.schema.hasTable("farm_history"))) {
      await sql.schema.createTable("farm_history", (t) => {
        t.timestamp("changed_at");
        t.integer("token_id");
        t.string("name");
        t.string("quality");
        t.integer("type");
        t.integer("level");
        t.integer("cfg_id");
        t.integer("feature");
        t.integer("style");
        t.integer("area");
        t.integer("visual");
        t.integer("billboard");
        t.integer("greenhouse_amount");
        t.integer("defender_attributes_bonus");
        t.integer("plant_time");
        t.integer("seed_consumption");
        t.integer("weed_production");
        t.integer("max_storage");
        t.integer("claimable_storage");
        t.integer("max_h_p");
        t.integer("current_h_p");
        t.integer("farm_state");
        // add all the attributes of the farm
      });
      done = true;
      debug('Table "farm_history" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = AddTurfAndFarmProduction;
