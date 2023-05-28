const express = require("express");
const router = express.Router();
const chatsController = require("../../../controllers/chatsController");

router.post("/create-or-get", chatsController.createOrGet);
router.post("/create-group-chat", chatsController.createGroupChat);
router.get("/", chatsController.getAllChats);
router.patch("/update/:chatId", chatsController.updateGroupChat);
router.patch("/add-user", chatsController.addUser);
router.patch("/remove-user", chatsController.removeUser);
router.patch("/add-admin", chatsController.addAdmin);
router.patch("/remove-admin", chatsController.removeAdmin);

module.exports = router;
