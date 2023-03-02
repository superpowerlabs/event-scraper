const debug = require("../debug");

class ModifyVolume extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasColumn("volume", "tx_id"))) {
      // I am deleting it and recreating because the data are incompatible and
      // we need to refill them
      await sql.schema.dropTable("volume");
      await sql.schema.createTable("volume", (table) => {
        table.integer("amount").notNullable();
        table.integer("block").notNullable();
        table.text("tx_id").notNullable().unique();
        table.integer("total_stake").notNullable();
        table.integer("timestamp").notNullable();
      });
      done = true;
      debug('Add "tx_id" and "timestamp" to "volume"');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = ModifyVolume;
