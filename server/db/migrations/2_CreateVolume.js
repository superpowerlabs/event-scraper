const debug = require("../debug");

class CreateVolume extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("volume"))) {
      await sql.schema.createTable("volume", (table) => {
        table.integer("amount");
        table.integer("block");
      });
      done = true;
      debug('Table "volume" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateVolume;
