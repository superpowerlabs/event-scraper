require("dotenv").config();
const express = require("express");
const apiV1 = require("./routes/apiV1");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const pino = require("pino")("./logs/info.log");
const expressPino = require("express-pino-logger")({
  logger: pino,
});

process.on("uncaughtException", function (error) {
  console.log(error.message);
  console.log(error.stack);

  // if(!error.isOperational)
  //   process.exit(1)
});

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
    content: "Superpower API V1",
  });
});

app.use("/hello", function (req, res) {
  res.json({
    hello: "world",
    listeningFrom: process.env.WHEREAMI,
  });
});

// TODO activate one of the other based on the hostname
app.use("/api/v1", apiV1);

app.use("/v1", apiV1);

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
