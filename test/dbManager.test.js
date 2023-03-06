// noinspection DuplicatedCode

const expect = require("chai").expect;
const dbManager = require("../src/lib/DbManager");
const migrate = require("../src/db/migrations/migrate");

describe("Integration test", function () {
  beforeEach(async () => {
    // run the migrations and do any other setup here
    await dbManager.resetDbIfTesting();
    await migrate(true);
  });

  it("should do something", async function () {});
});
