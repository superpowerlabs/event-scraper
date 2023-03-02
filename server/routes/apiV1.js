const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    content: "Mobland Protocol API V1",
  });
});

module.exports = router;
