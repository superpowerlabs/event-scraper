const debug = require("../debug");
const config = require("../../config/eventsByContract");
const deployed = require("../../config/deployedProduction.json");

class InsertContracts extends require("../Migration") {
  async body(index, database) {
    let done = false;
    let sql = await this.sql();

    if (await sql.schema.hasTable("event_scraper_config")) {
      for (const contract in config) {
        const address = deployed[config[contract].chainId][contract];
        const eventNames = config[contract].events.map((event) => event.name);
        try {
          await sql("event_scraper_config")
            .insert({
              name: contract,
              address: address.toLowerCase(),
              chain_id: config[contract].chainId,
              start_block: config[contract].startBlock,
              events: JSON.stringify(eventNames),
              started: true,
            })
            .onConflict("name")
            .ignore();
          debug(`Inserted event ${contract} successfully.`);
        } catch (error) {
          debug(`Error inserting event ${contract}:`, error);
        }
      }
      done = true;
      debug('Table "event_scraper_config" configured.');
    }
    if (!done) {
      debug("No change required for this migration");
    }
  }
}

module.exports = InsertContracts;
