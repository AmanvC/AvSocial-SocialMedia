const express = require("express");
const router = express();
const messagesController = require("../../../controllers/messagesController");

router.get("/:chatId", messagesController.getAllMessages);
router.post("/create", messagesController.createMessage);
router.patch("/update", messagesController.updateMessage);
router.patch("/delete", messagesController.deleteMessage);

module.exports = router;
