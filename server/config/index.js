const srcConfig = require("../../src/config");

// TODO: refactor or remove this file
const env = process.env;

const isLocal = process.platform === "darwin";
const isTest = env.NODE_ENV === "test";
const isDevelopment = isLocal;
const isProduction = env.NODE_ENV === "production";

module.exports = Object.assign(srcConfig, {
  isLocal,
  isTest,
  isDevelopment,
  isProduction,
});
