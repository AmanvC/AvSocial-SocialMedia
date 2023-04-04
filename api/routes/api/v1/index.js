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
  "/likes",
  passport.authenticate("jwt", { session: false }),
  require("./likes")
);

module.exports = router;
