const Case = require("case");
const _ = require("lodash");

const utils = {
  sleep: async (millis) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => setTimeout(resolve, millis));
  },

  nameTable(contractName, filter, version) {
    let attrs = filter
      .split("(")[1]
      .split(")")[0]
      .split(",")
      .map((e) => e.substring(0, 1));

    let parts = [Case.snake(contractName), Case.snake(filter.split("(")[0]), attrs.join("")];
    if (version !== "" && version) {
      parts.splice(1, 0, version);
    }
    return parts.join("__");
  },

  nameTableV1(contractName, eventName) {
    // useful to migrate data between tables
    return [Case.snake(contractName), Case.snake(eventName)].join("_");
  },
};

module.exports = utils;
