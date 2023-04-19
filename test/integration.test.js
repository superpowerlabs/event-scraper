// noinspection DuplicatedCode
const expect = require("chai").expect;
const fs = require("fs-extra");
fs.emptydirSync("./tmp/test");

const eventManager = require("../src/lib/EventManager");
const migrate = require("../src/db/migrations/migrate");
const { migrateEvents } = require("../src/migrateEvents");

describe("Integration test", function () {
  beforeEach(async () => {
    // run the migrations and do any other setup here
    await eventManager.init();
    await eventManager.resetDbIfTesting();
    await migrate(true);
    await migrateEvents();
  });

  it("check for syn_city_passes_transfer", async function () {
    let exist = await eventManager.tableExists(
      "syn_city_passes__transfer__aau"
    );
    expect(exist).equal(true);
  });

  it("check for syn_city_coupons_transfer", async function () {
    let exist = await eventManager.tableExists(
      "syn_city_coupons__transfer__aau"
    );
    expect(exist).equal(true);
  });

  describe("Testing dbManager event", function () {
    it("should insert event", async function () {
      const obj = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 16,
        },
      ];
      await eventManager.updateEvents(
        obj,
        "Transfer(address,address,uint256)",
        "SynCityCoupons"
      );
      let event = await eventManager.getEvent(
        "SynCityCoupons",
        "Transfer(address,address,uint256)",
        {
          token_id: 16,
        }
      );
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].token_id).equal(16);
    });
    it("should batch insert", async function () {
      const obj = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 16,
        },
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 17,
        },
      ];
      await eventManager.updateEvents(
        obj,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      let event = await eventManager.getEvent(
        "SynCityPasses",
        "Transfer(address,address,uint256)",
        {
          transaction_hash: "hash",
        }
      );
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].token_id).equal(16);
      expect(event[1].transaction_hash).equal("hash");
      expect(event[1].block_number).equal(1);
      expect(event[1].to).equal("you");
      expect(event[1].from).equal("me");
      expect(event[1].token_id).equal(17);
    });
    it("should insert batch transfer", async function () {
      const obj = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 16,
        },
      ];
      const obj1 = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 17,
        },
      ];
      await eventManager.updateEvents(
        obj,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      await eventManager.updateEvents(
        obj1,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      let event = await eventManager.getEvent(
        "SynCityPasses",
        "Transfer(address,address,uint256)",
        {
          token_id: 16,
        }
      );
      expect(event[0].transaction_hash).equal("hash");
      expect(event[0].block_number).equal(1);
      expect(event[0].to).equal("you");
      expect(event[0].from).equal("me");
      expect(event[0].token_id).equal(16);
      let event1 = await eventManager.getEvent(
        "SynCityPasses",
        "Transfer(address,address,uint256)",
        {
          token_id: 17,
        }
      );
      expect(event1[0].transaction_hash).equal("hash");
      expect(event1[0].block_number).equal(1);
      expect(event1[0].to).equal("you");
      expect(event1[0].from).equal("me");
      expect(event1[0].token_id).equal(17);
    });
    it("should get latest event by block_number", async function () {
      const obj = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 16,
        },
      ];
      const obj1 = [
        {
          transaction_hash: "hesh",
          block_timestamp: Date.now(),
          block_number: 2,
          to: "you",
          from: "me",
          token_id: 17,
        },
      ];
      const obj2 = [
        {
          transaction_hash: "hosh",
          block_timestamp: Date.now(),
          block_number: 3,
          to: "you",
          from: "me",
          token_id: 18,
        },
      ];
      const obj3 = [
        {
          transaction_hash: "hish",
          block_timestamp: Date.now(),
          block_number: 4,
          to: "you",
          from: "me",
          token_id: 19,
        },
      ];
      const obj4 = [
        {
          transaction_hash: "hish",
          block_timestamp: Date.now(),
          block_number: 3,
          to: "you",
          from: "me",
          token_id: 20,
        },
      ];
      await eventManager.updateEvents(
        obj,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      await eventManager.updateEvents(
        obj1,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      await eventManager.updateEvents(
        obj2,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      await eventManager.updateEvents(
        obj3,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      await eventManager.updateEvents(
        obj4,
        "Transfer(address,address,uint256)",
        "SynCityPasses"
      );
      let event = await eventManager.latestEvents(
        "SynCityPasses",
        "Transfer(address,address,uint256)"
      );
      event = event[0];
      expect(event.transaction_hash).equal("hish");
      expect(event.block_number).equal(4);
      expect(event.to).equal("you");
      expect(event.from).equal("me");
      expect(event.token_id).equal(19);
    });

    it("should revert if inserting same events", async function () {
      const obj = [
        {
          transaction_hash: "hash",
          block_timestamp: Date.now(),
          block_number: 1,
          to: "you",
          from: "me",
          token_id: 16,
        },
      ];
      try {
        await eventManager.updateEvents(
          obj,
          "Transfer(address,address,uint256)",
          "MissingContract"
        );
        expect(true).equal(false);
      } catch (error) {
        expect(error.code).equal("SQLITE_ERROR");
      }
    });
  });
});
