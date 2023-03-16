const debug = require("../debug");

class MigrateDataFromT1toT2 extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    // await sql.schema.dropTableIfExists("test");

    if (await sql.schema.hasTable("syn_city_passes_transfer")) {
      if (await sql.schema.hasColumn("syn_city_passes_transfer", "tokenid")) {
        await sql.schema.raw(`alter table syn_city_passes_transfer rename column tokenid to token_id;`);
        done = true;
        debug('Table "syn_city_passes_transfer" tokenid changed to token_id.');
      }
      if (!(await sql.schema.hasColumn("syn_city_passes_transfer", "id"))) {
        await sql.schema.raw("alter table syn_city_passes_transfer add column id serial primary key;");
        done = true;
        debug('Table "syn_city_passes_transfer" column id created.');
      }
    }
    if (!done) {
      debug("No change required for this migration");
    }

    if (await sql.schema.hasTable("syn_city_coupons_transfer")) {
      if (await sql.schema.hasColumn("syn_city_coupons_transfer", "tokenid")) {
        await sql.schema.raw(`alter table syn_city_coupons_transfer rename column tokenid to token_id;`);
        done = true;
        debug('Table "syn_city_coupons_transfer" tokenid changed to token_id.');
      }
      if (!(await sql.schema.hasColumn("syn_city_coupons_transfer", "id"))) {
        await sql.schema.raw("alter table syn_city_coupons_transfer add column id serial primary key;");
        done = true;
        debug('Table "syn_city_coupons_transfer" column id created.');
      }
    }

    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = MigrateDataFromT1toT2;
