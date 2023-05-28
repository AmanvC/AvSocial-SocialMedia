const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(url, connectionParams);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Error in DB"));

db.once("open", () => {
  console.log("Database connection successful.");
});

module.exports = db;
