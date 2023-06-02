const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let db;

const connectDB = async () => {
  try {
    await mongoose.connect(url, connectionParams);
    db = mongoose.connection;
    console.log("Database connection successful.");
  } catch (err) {
    console.log(err);
    console.error("Error in connecting to database!!!");
  }
};

connectDB();

module.exports = db;
