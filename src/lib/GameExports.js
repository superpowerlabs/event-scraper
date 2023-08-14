const Sql = require("../db/Sql");
const _ = require("lodash");

let dbw;
let dbr;

class GameExports extends Sql {
  async init() {
    dbw = await this.sql();
    dbr = await this.sql(true); // read only
    this.initiated = true;
  }

  static tableName = "game_exports";

  async checkGameExport(keys) {
    try {
      const columnsInfo = await dbw(GameExports.tableName).columnInfo();
      if (_.has(columnsInfo, "minted")) {
        console.log("Column 'minted' found.");

        await dbw(GameExports.tableName).whereIn("id", keys).update({ minted: true });

        console.log(`Column 'minted' updated to true for rows with keys: ${keys.join(", ")}`);
      } else {
        console.log("Column 'minted' not found in the table.");
      }
    } catch (error) {
      console.error("Error while updating data in PostgreSQL", error);
    }
  }
}

let gameExports;
if (!gameExports) {
  gameExports = new GameExports();
  gameExports.init();
}
module.exports = gameExports;
