const debug = require("../debug");
const fs = require("fs");
const path = require("path");

class CreateTemporaryUrlsTable extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (!(await sql.schema.hasTable("temporary_urls"))) {
      await sql.schema.createTable("temporary_urls", (table) => {
        table.string("code").unique();
        table.text("discord_user_json");
        table.string("date_string");
        table.string("interaction_id");
        table.timestamp("started_at");
        table.timestamp("validated_at");
        table.string("wallet");
        table.text("message");
      });
      done = true;
      debug('Table "temporary_urls" created.');
    }

    if (await sql.schema.hasColumn("temporary_urls", "validated")) {
      await sql.schema.alterTable("temporary_urls", (table) => {
        table.dropColumn("validated");
      });
      done = true;
      debug('Drop "validated" from "temporary_urls"');
    }

    if (!(await sql.schema.hasColumn("temporary_urls", "wallet"))) {
      await sql.schema.alterTable("temporary_urls", (table) => {
        table.string("wallet");
      });
      done = true;
      debug('Add "wallet" to "temporary_urls"');
    }

    if (await sql.schema.hasColumn("temporary_urls", "community")) {
      await sql.schema.alterTable("temporary_urls", (table) => {
        table.dropColumn("community");
      });
      done = true;
      debug('Drop "community" from "temporary_urls"');
    }

    if (!(await sql.schema.hasColumn("temporary_urls", "message"))) {
      await sql.schema.alterTable("temporary_urls", (table) => {
        table.text("message");
      });
      done = true;
      debug('Add "message" from "temporary_urls"');
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = CreateTemporaryUrlsTable;
