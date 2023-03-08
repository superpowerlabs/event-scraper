const app = require("../server/app.js");
const { expect } = require("chai");
const request = require("supertest");

describe("API root path", () => {
  it("should return API information", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).to.eq(200);
  });
});
