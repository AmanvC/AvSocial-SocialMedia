const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 * 24 });

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
