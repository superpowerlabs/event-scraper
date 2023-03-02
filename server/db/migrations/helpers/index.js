const Sql = require("../../Sql");

class Helpers extends Sql {
  async indexExists(tableName, indexName) {
    const sql = await this.sql();
    const select = `select t.relname as table_name,
                           i.relname as index_name,
                           a.attname as column_name
                    from pg_class t,
                         pg_class i,
                         pg_index ix,
                         pg_attribute a
                    where t.oid = ix.indrelid
                      and i.oid = ix.indexrelid
                      and a.attrelid = t.oid
                      and a.attnum = ANY (ix.indkey)
                      and t.relkind = 'r'
                      and t.relname like '${tableName}'
                    order by t.relname,
                             i.relname;`;

    const rows = (await sql.schema.raw(select)).rows;

    for (let row of rows) {
      if (row.index_name === indexName) {
        return true;
      }
    }
    return false;
  }
}

module.exports = new Helpers();
