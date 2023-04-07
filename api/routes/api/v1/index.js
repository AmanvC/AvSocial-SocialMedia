const express = require("express");
const passport = require("passport");
const router = express.Router();

router.use("/users", require("./users"));
router.use(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  require("./posts")
);
router.use(
  "/stories",
  passport.authenticate("jwt", { session: false }),
  require("./stories")
);
router.use(
  "/comments",
  passport.authenticate("jwt", { session: false }),
  require("./comments")
);

module.exports = router;
