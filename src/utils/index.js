const description = require("../../server/config/description");
const Case = require("case");
const _ = require("lodash");

const nftSize = {
  1: "4x4",
  2: "6x6",
  3: "8x8",
  4: "10x10",
  5: "12x12",
};

const quality = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
};

const utils = {
  setHistory(trait, value, history) {
    let result;
    for (let elem of history) {
      if (elem[trait] !== null && elem[trait] !== value) {
        if (!result) {
          result = [];
        }
        result.push({
          changedAt: parseInt(new Date(elem.changed_at).getTime() / 1000),
          value: elem[trait],
        });
      }
    }
    return result;
  },

  formatAttributes(metadata, history) {
    let meta = [];
    let data = {};
    let obj = [];
    const row = _.clone(metadata[0]);
    const turf = /turf/i.test(row.name);
    if (turf) {
      data.description = description.turfDescription;
    } else {
      data.description = description.farmDescription;
    }
    data.image = this.getImageUri(row);
    data.name = row.name;
    data.tokenId = row.token_id;
    delete row.name;
    delete row.image;
    delete row.token_id;
    if (typeof row.quality === "number" || /^\d+$/.test(row.quality)) {
      row.quality = quality[row.quality];
    }
    for (let key in row) {
      let trait = {
        trait_type: Case.capital(key).replace(/ /g, ""),
        value: row[key],
      };
      let changes = this.setHistory(key, row[key], history);
      if (changes) {
        trait.history = changes;
      }
      obj.push(trait);
    }
    data.attributes = Object.assign(obj);
    meta = data;
    return meta;
  },

  //   turf_level1_4x4.png
  getImageUri(row) {
    let image = "https://data.mob.land/";
    let nft = row.name.split(" ");
    const size = nftSize[row.level];
    if (nft[0] === "Turf") {
      image += "turfs/turf_";
      image += "level" + row.level + "_" + size + ".png";
    } else {
      image += "farms/farm_";
      image += "level" + row.level + "_" + size + ".png";
    }
    return image;
  },

  cleanStruct(struct) {
    let ret = {};
    for (let key in struct) {
      if (isNaN(parseInt(key))) {
        ret[key] = struct[key];
      }
    }
    return ret;
  },
};

module.exports = utils;
