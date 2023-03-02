// noinspection DuplicatedCode

const expect = require("chai").expect;
const dbManager = require("../lib/DbManager");
const migrate = require("../db/migrations/migrate");

describe("Integration test", function () {
  beforeEach(async () => {
    // run the migrations and do any other setup here
    await dbManager.resetDbIfTesting();
    await migrate(true);
  });

  it("should do something", async function () {});
});
