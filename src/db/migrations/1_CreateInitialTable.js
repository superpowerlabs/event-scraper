const debug = require("../debug");

class CreateInitialTables extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (!(await sql.schema.hasTable("test"))) {
      await sql.schema.createTable("test", async (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.timestamp("created_at").defaultTo(sql.fn.now());
      });
      done = true;
      debug('Table "test" created.');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

// t.increment("id").primary();
// t.timestamp("created_at").defaultTo(sql.fn.now());
// t.text("transaction_json").notNullable();
// t.text("transaction_hash").notNullable().unique();
// t.integer("block_number").notNullable();
// t.text("data").notNullable();

// +
// the field from the event, for example:
// t.string("to").index();
// t.string("from").index();
// t.bigint("tokenId").index();

// let item = {
//   "name": "from",
//   "type": "string",
//   "indexed": true
// }
// for (let item of event) {
// t[item.type](item.name).index(item.indexed);
// }

module.exports = CreateInitialTables;
