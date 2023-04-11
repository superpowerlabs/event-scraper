const Case = require("case");
const _ = require("lodash");

const utils = {
  sleep: async (millis) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => setTimeout(resolve, millis));
  },

  nameTable(contractName, eventName) {
    // changed to avoid conflicts with existing tables
    return [Case.snake(contractName), Case.snake(eventName)].join("__");
  },

  nameTableV1(contractName, eventName) {
    // useful to migrate data between tables
    return [Case.snake(contractName), Case.snake(eventName)].join("_");
  },
};

module.exports = utils;
