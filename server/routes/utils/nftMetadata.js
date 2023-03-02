const Case = require("case");
const _ = require("lodash");

const nftSize = {
  4: "2x2",
  6: "2x3",
  9: "3x3",
  12: "3x4",
  16: "4x4",
  36: "6x6",
  64: "8x8",
  100: "10x10",
  144: "12x12",
};

const turfNameByArea = {
  16: "Lakeside",
  36: "Farmland",
  64: "Residential",
  100: "Woodland",
  144: "The Rockies",
};

const descriptions = {
  turf: "Turf is the foundational layer in the Mafia Metaverse upon which businesses operate and generate value.",
  farm: "Farm is an upgradable revenue generating business license to operate on Turf, produce in-game commodities, and provide services to players.",
};

const names = {
  turf: "MOBLAND {spec} Turf #{id}",
  farm: "MOBLAND Weed Farm #{id}",
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

  formatAttributes(nft, metadata, history, id) {
    let data = {};
    let obj = [];
    if (id === "0") {
      data = {
        name: names[nft].split(" #")[0],
        description: descriptions[nft],
        seller_fee_basis_points: 250,
        fee_recipient: "0x6958De0121F4452FD10f43d2084f851019453794",
      };
    } else if (metadata) {
      const row = _.clone(metadata[0]);
      data.tokenId = row.token_id;
      data.name = names[nft]
        .replace(/\{id\}/, row.token_id)
        .replace(/\{spec\}/, turfNameByArea[row.total_area]);
      data.image = this.getImageUri(nft, row);
      data.description = descriptions[nft];
      delete row.name;
      delete row.image;
      delete row.token_id;
      delete row.cfg_id;
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
    } else {
      data.tokenId = id;
      data.name = names[nft].replace(/\{id\}/, id).replace(/\{spec\} /, "");
      data.image = this.getImageUri(nft);
      data.description = descriptions[nft];
      data.attributes = [
        {
          trait_type: "Status",
          value: "Unrevealed",
        },
      ];
    }
    return data;
  },

  // Example: turf_level1_4x4.png
  getImageUri(nft, row) {
    let image = `https://data.mob.land/${nft}s/${nft}_`;
    if (row) {
      const size = nftSize[row.area || row.total_area];
      image += "level" + row.level + "_" + size + ".png";
    } else {
      image += "unrevealed.png";
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
