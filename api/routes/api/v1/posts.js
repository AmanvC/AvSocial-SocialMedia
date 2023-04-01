const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  return res.send("<h1>Working</h1>");
});
router.use("/comments", require("./comments"));

module.exports = router;
