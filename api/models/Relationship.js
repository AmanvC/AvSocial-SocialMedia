const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema(
  {
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Accepted", "Not Accepted"],
      default: "Not Accepted",
    },
  },
  {
    timestamps: true,
  }
);

const Relationship = mongoose.model("Relationship", relationshipSchema);

module.exports = Relationship;
