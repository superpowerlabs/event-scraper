// noinspection DuplicatedCode

const expect = require("chai").expect;
const dbManager = require("../src/lib/DbManager");
const migrate = require("../src/db/migrations/migrate");
const { migrateEvents } = require("../src/migrateEvents");

describe("Integration test", function () {
  beforeEach(async () => {
    // run the migrations and do any other setup here
    await dbManager.resetDbIfTesting();
    await migrate(true);
    await migrateEvents();
  });

  it("check for syn_city_passes_transfer", async function () {
    let exist = await dbManager.table("syn_city_passes_transfer");
    expect(exist).equal(true);
  });
  it.skip("check for syn_city_coupons_transfer", async function () {
    let exist = await dbManager.table("syn_city_coupons_transfer");
    expect(exist).equal(true);
  });

  describe("Testing dbManager event", function () {
    it("should insert event", async function () {
      const obj = [{ transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 16 }];
      await dbManager.updateEvents(obj, "Transfer", "SynCityCoupons");
      let event = await dbManager.getEvent("SynCityCoupons", "Transfer", { tokenid: 16 });
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].tokenid).equal(16);
    });
    it("should batch insert", async function () {
      const obj = [
        { transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 16 },
        { transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 17 },
      ];
      await dbManager.updateEvents(obj, "Transfer", "SynCityPasses");
      let event = await dbManager.getEvent("SynCityPasses", "Transfer", { transaction_hash: "hash" });
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].tokenid).equal(16);
      expect(event[1].transaction_hash).equal("hash");
      expect(event[1].block_number).equal(1);
      expect(event[1].to).equal("you");
      expect(event[1].from).equal("me");
      expect(event[1].tokenid).equal(17);
    });
    it("should insert batch transfer", async function () {
      const obj = [{ transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 16 }];
      const obj1 = [{ transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 17 }];
      await dbManager.updateEvents(obj, "Transfer", "SynCityPasses");
      await dbManager.updateEvents(obj1, "Transfer", "SynCityPasses");
      let event = await dbManager.getEvent("SynCityPasses", "Transfer", { tokenid: 16 });
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].tokenid).equal(16);
      let event1 = await dbManager.getEvent("SynCityPasses", "Transfer", { tokenid: 17 });
      expect(event1[0].transaction_hash).equal("hash");
      expect(event1[0].block_number).equal(1);
      expect(event1[0].to).equal("you");
      expect(event1[0].from).equal("me");
      expect(event1[0].tokenid).equal(17);
    });
    it("should get latest event by block_number", async function () {
      const obj = [{ transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 16 }];
      const obj1 = [{ transaction_hash: "hesh", block_number: 2, to: "you", from: "me", tokenid: 17 }];
      const obj2 = [{ transaction_hash: "hosh", block_number: 3, to: "you", from: "me", tokenid: 18 }];
      const obj3 = [{ transaction_hash: "hish", block_number: 4, to: "you", from: "me", tokenid: 19 }];
      const obj4 = [{ transaction_hash: "hish", block_number: 3, to: "you", from: "me", tokenid: 20 }];
      await dbManager.updateEvents(obj, "Transfer", "SynCityPasses");
      await dbManager.updateEvents(obj1, "Transfer", "SynCityPasses");
      await dbManager.updateEvents(obj2, "Transfer", "SynCityPasses");
      await dbManager.updateEvents(obj3, "Transfer", "SynCityPasses");
      await dbManager.updateEvents(obj4, "Transfer", "SynCityPasses");
      let event = await dbManager.latestEvent("SynCityPasses", "Transfer");
      expect(event.transaction_hash).equal("hish");
      expect(event.block_number).equal(4);
      expect(event.to).equal("you");
      expect(event.from).equal("me");
      expect(event.tokenid).equal(19);
    });
    it("should revert if inserting same events", async function () {
      const obj = [{ transaction_hash: "hash", block_number: 1, to: "you", from: "me", tokenid: 16 }];
      await dbManager.updateEvents(obj, "Transfer", "SynCityPasses");
      let error = await dbManager.updateEvents(obj, "Transfer", "SynCityPasses");
      expect(error.code).equal("SQLITE_CONSTRAINT");
    });
  });
});
