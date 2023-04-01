const express = require("express");
const port = 5000;
const passportJwt = require("./config/passport-jwt-strategy");
const db = require("./config/mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes"));

app.listen(port, (err) => {
  if (err) {
    console.log(`Error in starting the express server: ${err}`);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});
