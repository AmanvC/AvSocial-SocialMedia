const express = require("express");
const port = 5000;
const dotenv = require("dotenv").config();
const passport = require("passport");
const passportJwt = require("./config/passport-jwt-strategy");
const db = require("./config/mongoose");
const cors = require("cors");
const multer = require("multer");

const app = express();

// app.use((req, res, next) => {
//   // To be able to send cookies
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });
app.use(cors());

// Handle uploading a file using multer, all upload file request will come here and in other requests we will set path for document field
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post(
  "/api/v1/upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  (req, res) => {
    const file = req.file;
    return res.status(200).json(file.filename);
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("./routes"));

app.listen(port, (err) => {
  if (err) {
    console.log(`Error in starting the express server: ${err}`);
    return;
  }
  console.log(`Server is running on port: ${port}`);
});
