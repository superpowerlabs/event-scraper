require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const ethers = require("ethers");
const pino = require("pino")("./logs/info.log");
const { processMoralisStreamEvent } = require("../src/lib/eventScraper");
const expressPino = require("express-pino-logger")({
  logger: pino,
});

process.on("uncaughtException", function (error) {
  console.log(error.message);
  console.log(error.stack);

  // if(!error.isOperational)
  //   process.exit(1)
});

const verifySignature = (req, secret) => {
  const providedSignature = req.headers["x-signature"];
  if (!providedSignature) throw new Error("Signature not provided");
  const generatedSignature = ethers.utils.id(JSON.stringify(req.body) + secret);
  if (generatedSignature !== providedSignature)
    throw new Error("Invalid Signature");
};

const app = express();
app.use(expressPino);

const limiter = rateLimit({
  windowMs: 10 * 1000,
  max: 60,
  keyGenerator: (req) => {
    return (
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress
    );
  },
});

app.use(limiter);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    content: "Superpower Moralis Streams API",
  });
});

app.use("/hello", function (req, res) {
  res.json({
    hello: "world",
    listeningFrom: process.env.WHEREAMI,
  });
});

app.post("/moralis", async (req, res) => {
  verifySignature(req, process.env.MORALIS_STREAM_SECRET_KEY);
  //TODO: For now we ignore Confirmation of the EVENT
  //We can consider later if we notice it causes issues with events that have been reverted and are present in the database when they should not be.
  if (!req.body.confirmed) {
    processMoralisStreamEvent(req.body);
  }
  res.status(200).json();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404);
  res.json({
    error: "404 Page not Found",
  });
});

// error handler
app.use(function (err, req, res, next) {
  const errorCode = err.status || 500;
  // render the error page
  res.status(errorCode);
  res.json({ code: errorCode, error: "Fatal error" });
});

module.exports = app;
