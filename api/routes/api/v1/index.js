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
router.use(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  require("./profile")
);
router.use(
  "/relationship",
  passport.authenticate("jwt", { session: false }),
  require("./relationship")
);
router.use(
  "/messages",
  passport.authenticate("jwt", { session: false }),
  require("./messages")
);
router.use(
  "/chats",
  passport.authenticate("jwt", { session: false }),
  require("./chats")
);

module.exports = router;
