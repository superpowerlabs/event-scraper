const Case = require("case");
const _ = require("lodash");

const utils = {

  sleep: async (millis) => {
    // eslint-disable-next-line no-undef
    return new Promise((resolve) => setTimeout(resolve, millis));
  },

  nameTable(contractName, eventName) {
    return [Case.snake(contractName), Case.snake(eventName)].join("_");
  },

};

module.exports = utils;
