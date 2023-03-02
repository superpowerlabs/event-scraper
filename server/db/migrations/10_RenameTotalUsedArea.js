const debug = require("../debug");

class RenameTotalUsedArea extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasColumn("turf", "total_area"))) {
      await sql.schema.alterTable("turf", (t) => {
        t.integer("total_area");
      });
      await sql("turf").where({ total_used_area: 100 }).update({
        total_area: 100,
      });
      await sql("turf").where({ total_used_area: 144 }).update({
        total_area: 144,
      });
      await sql.schema.alterTable("turf", (t) => {
        t.dropColumn("total_used_area");
      });
      done = true;
      debug('Column "total_used_ares" renamed "total_area" in "turf".');
    }

    if (!(await sql.schema.hasColumn("turf_history", "total_area"))) {
      await sql.schema.alterTable("turf_history", (t) => {
        t.integer("total_area");
        t.dropColumn("total_used_area");
      });
      done = true;
      debug(
        "info",
        'Column "total_used_ares" renamed "total_area" in "turf_history".'
      );
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = RenameTotalUsedArea;
