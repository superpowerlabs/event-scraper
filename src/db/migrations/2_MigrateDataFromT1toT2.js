const debug = require("../debug");

class MigrateDataFromT1toT2 extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (await sql.schema.hasTable("syn_city_passes_transfer")) {
      // alter table to add increments("id").primary()
      // rename column
      await sql.schema.raw(`
      
      `);
      done = true;
      debug('Table "test" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = MigrateDataFromT1toT2;
