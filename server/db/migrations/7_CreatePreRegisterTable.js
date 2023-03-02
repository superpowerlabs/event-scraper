const debug = require("../debug");

class CreatePreRegisterTable extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("preregister");

    if (!(await sql.schema.hasTable("preregister"))) {
      await sql.schema.createTable("preregister", (table) => {
        table.string("wallet").primary();
        table.text("email");
        table.string("signature");
        table.string("partner");
        table.timestamp("created_at");
        table.text("temp_email");
        table.string("confirmation_code");
        table.timestamp("confirmed_at");
        table.string("login_type");
      });
      done = true;
      debug('Table "preregister" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreatePreRegisterTable;
