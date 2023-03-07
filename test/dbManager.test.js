// noinspection DuplicatedCode

const expect = require("chai").expect;
const dbManager = require("../src/lib/DbManager");
const migrate = require("../src/db/migrations/migrate");

describe("Integration test", function () {
  beforeEach(async () => {
    // run the migrations and do any other setup here
    await dbManager.resetDbIfTesting();
    await migrate(true);
    await migrateEvents();
  });

  it("check for syn_city_passes_transfer", async function () {
    let exist = await dbManager.tableExist("syn_city_passes_transfer");
    expect(exist).equal(true);
  });
  it("check for syn_city_passes_approval", async function () {
    let exist = await dbManager.tableExist("syn_city_passes_approval");
    expect(exist).equal(true);
  });
  it("check for syn_city_coupons_transfer", async function () {
    let exist = await dbManager.tableExist("syn_city_coupons_transfer");
    expect(exist).equal(true);
  });
});
