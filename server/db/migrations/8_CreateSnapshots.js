const debug = require("../debug");

class CreateSnapshots extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("snapshots");

    if (!(await sql.schema.hasTable("snapshots"))) {
      await sql.schema.createTable("snapshots", (table) => {
        table.string("wallet");
        table.bigint("total");
        table.bigint("average");
        table.integer("passes");
        table.timestamp("got_at");
        table.unique(["wallet", "got_at"]);
      });
      done = true;
      debug('Table "snapshots" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateSnapshots;
