const debug = require("../debug");

class CreateOwnerTable extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("owners"))) {
      await sql.schema.createTable("owners", (table) => {
        table.string("wallet");
        table.string("tokenId");
      });
      done = true;
      debug('Table "owners" created.');
    }

    if (
      !(await sql.schema.hasColumn("owners", "owner")) ||
      (await sql.schema.hasColumn("owners", "token"))
    ) {
      await sql.schema.dropTable("owners");
      await sql.schema.createTable("owners", (table) => {
        table.integer("token_id").primary();
        table.string("owner");
        table.string("virtual_owner");
        table.string("updated_at");
      });
      done = true;
      debug('Table "owners" dropped and recreated.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateOwnerTable;
