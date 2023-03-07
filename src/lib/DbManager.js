const Sql = require("../db/Sql");
const Case = require("case");

let dbw;
let dbr;

class DbManager extends Sql {
  // for reference
  // https://knexjs.org

  async init() {
    dbw = await this.sql();
    dbr = await this.sql(true); // read only
    this.initiated = true;
  }

  async resetDbIfTesting() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("This can be used only for testing");
    }
    await (
      await this.sql()
    ).schema.dropTableIfExists("syn_city_passes_transfer");
    await (
      await this.sql()
    ).schema.dropTableIfExists("syn_city_passes_approval");
    await (
      await this.sql()
    ).schema.dropTableIfExists("syn_city_coupons_transfer");
    // TODO complete it
  }

  async tableExist(tablename) {
    if (!(await dbr.schema.hasTable(tablename))) {
      return false;
    } else {
      return true;
    }
  }

  async getEvents(event) {
    return dbr.select("*").from(event);
  }

  async snapshotAt(got_at) {
    return dbr.raw(`SELECT * FROM snapshots WHERE got_at = '${got_at}';`);
  }

  async lastSnapshotAt() {
    return (await dbr.raw(`SELECT MAX(got_at) as x FROM snapshots;`)).rows[0].x;
  }

  async sumTotals(wallet) {
    return dbr.raw(
      `SELECT SUM(total) as total FROM snapshots WHERE wallet = '${wallet}';`
    );
  }

  async snapshot(wallet, got_at) {
    return dbr.select("*").from("snapshots").where({ wallet, got_at });
  }

  async insertSnapshot(got_at, rows) {
    // clean previous snapshot
    await dbw("snapshots").where({ got_at }).del();
    rows = rows.map((e) => {
      e.got_at = got_at;
      return e;
    });
    await dbw("snapshots").insert(rows);
  }

  async attributes(nft, token_id) {
    return dbr.select("*").from(nft).where({ token_id });
  }

  async attributesHistory(nft, token_id) {
    return dbr
      .select("*")
      .from(nft + "_history")
      .where({ token_id })
      .orderBy("changed_at", "desc");
  }

  async setAttributes(nft, token_id, attributes) {
    const exist = await this.attributes(nft, token_id);
    try {
      if (exist.length === 0) {
        await dbw.insert(attributes).into(nft);
      } else {
        await dbw(nft).where({ token_id }).update(attributes);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async preregister(wallet) {
    return dbr.select("*").from("preregister").where({ wallet });
  }

  async preregisterByConfirmationCode(confirmation_code) {
    // console.log(confirmation_code);
    return dbr
      .select("*")
      .from("preregister")
      .where({ confirmation_code })
      .first();
  }

  async setPreregister(obj) {
    const exist = await this.preregister(obj.wallet);
    try {
      if (exist.length === 0) {
        obj["created_at"] = dbr.fn.now();
        await dbw.insert(obj).into("preregister");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updatePreregisterConfirmEmail(obj) {
    obj["confirmed_at"] = dbr.fn.now();
    return this.updatePreregister(obj);
  }

  async updatePreregister(obj) {
    const wallet = obj.wallet;
    delete obj.wallet;
    try {
      await dbw("preregister").where({ wallet }).update(obj);
    } catch (e) {
      console.error(e);
    }
  }

  async preregisterAmount(partner) {
    if (partner) {
      return dbr.count("wallet").from("preregister").where({ partner }).first();
    } else {
      return dbr.count("wallet").from("preregister").first();
    }
  }

  async owners(token_id) {
    return dbr.select("*").from("owners").where({ token_id });
  }

  async tokenIDsByWallet(wallet) {
    return dbr
      .select("token_id")
      .from("owners")
      .where({ virtual_owner: wallet });
  }

  async virtualOwner(token_id) {
    return dbr.raw(`
select distinct owners.virtual_owner 
from owners 
inner join temporary_urls on temporary_urls.wallet = owners.virtual_owner
where temporary_urls.validated_at is not null && owners.token_id = ${token_id};    
    `);
  }

  async allOwners() {
    return dbr.select("*").from("owners");
  }

  async allValidated() {
    return dbr.select("*").from("temporary_urls").whereNotNull("validated_at");
  }

  async setOwners(data) {
    let { token_id } = data;
    const exist = await this.owners(token_id);
    data.updated_at = dbr.fn.now();
    try {
      if (exist.length === 0) {
        //attributes = Object.assign(attributes, { id });
        await dbw.insert(data).into("owners");
      } else {
        await dbw("owners").where({ token_id }).update(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async temporaryUrl(code) {
    return dbr.select("*").from("temporary_urls").where({ code });
  }

  async setTemporaryUrl(code, discordUser, interactionId, dateString, message) {
    await dbw
      .insert({
        started_at: dbr.fn.now(),
        code,
        discord_user_json: JSON.stringify(discordUser),
        interaction_id: interactionId,
        date_string: dateString,
        message,
      })
      .into("temporary_urls");
  }

  async setAsValidated(code, wallet) {
    const exist = await this.temporaryUrl(code);
    try {
      if (exist.length === 0) {
        return false;
      } else {
        await dbw("temporary_urls").where({ code }).update({
          validated_at: dbr.fn.now(),
          wallet,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  async updateAttributes(nft, token_id, attributes) {
    for (let trait in attributes) {
      let tmp = attributes[trait];
      delete attributes[trait];
      attributes[Case.snake(trait)] = tmp;
    }
    try {
      if (attributes.token_id) {
        return [1, "tokenId cannot be changed"];
      }
      const existingAttributes = (await this.attributes(nft, token_id))[0];
      if (!existingAttributes) {
        return [4, "Token not found"];
      }
      const history = {
        changed_at: dbr.fn.now(),
        token_id,
      };
      let changesRequired = false;
      for (let trait in attributes) {
        if (
          attributes[trait] !== undefined &&
          attributes[trait] !== existingAttributes[trait]
        ) {
          // we save in the history only values that have been changed
          changesRequired = true;
          history[trait] = existingAttributes[trait];
        }
      }
      if (!changesRequired) {
        return [2, "No changes required"];
      }
      await dbw(nft).where({ token_id }).update(attributes);
      await dbw.insert(history).into(`${nft}_history`);
      return [0];
    } catch (e) {
      return [3, e.message];
    }
  }

  async addVolumes(volumes) {
    // this can miss some import if the process is interrupted, but
    // it is a reasonable tradeoff, because it is more efficient than
    // checking if the transaction exist one by one
    try {
      await dbw.insert(volumes).into("volume");
      return true;
    } catch (e) {
      console.log(e);
    }
  }

  async volumeMaxBlock() {
    if ((await dbr.select("*").from("volume")).length) {
      return [
        (await dbr("volume").max("block"))[0].max,
        (await dbr("volume").max("total_stake"))[0].max,
      ];
    } else {
      return [0, 0];
    }
  }

  async getVolume() {
    return dbr.select("*").from("volume");
  }
}

let dbManager;
if (!dbManager) {
  dbManager = new DbManager();
  dbManager.init();
}
module.exports = dbManager;
