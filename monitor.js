#!/usr/bin/env node

require("dotenv").config();
const { migrateEvents } = require("./src/migrateEvents");
const eventScraper = require("./src/lib/eventScraper");

let options = {};

async function main() {
  await migrateEvents();
  options.scope = "realtime";
  await eventScraper(options);
}

main().then();
