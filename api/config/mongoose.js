const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/fullstack-social-media");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error in DB"));

db.once("open", () => {
  console.log("Database connection successful.");
});

module.exports = db;
