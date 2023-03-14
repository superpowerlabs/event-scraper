const eventScraper = require("./src/lib/eventScraper");
const { migrateEvents } = require("./src/migrateEvents");
const cron = require("node-cron");

const task = cron.schedule("* 12 * * *", async () => {
  await migrateEvents();
  await eventScraper(options);
});

task.start();
