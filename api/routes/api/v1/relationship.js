const express = require("express");
const relationshipController = require("../../../controllers/relationshipController");
const router = express.Router();

router.get("/status/:user_id", relationshipController.getRelationshipStatus);
router.post("/create", relationshipController.createRelationshipRequest);
router.post("/accept", relationshipController.acceptRelationship);
// router.delete(
//   "/delete_request",
//   relationshipController.deleteRelationshipRequest
// );
router.delete("/delete", relationshipController.deleteRelationship);
router.get("/pending", relationshipController.pendingRelationships);

module.exports = router;
