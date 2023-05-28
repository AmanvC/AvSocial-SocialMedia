const express = require("express");
const port = 5000;
const dotenv = require("dotenv").config();
const passport = require("passport");
const passportJwt = require("./config/passport-jwt-strategy");
const db = require("./config/mongoose");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();

// app.use((req, res, next) => {
//   // To be able to send cookies
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });
app.use(
  cors({
    origin: process.env.CLIENT_URL
  })
);

const { uploadFile } = require("./config/s3");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.post(
  "/api/v1/upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();
    const imageName = await uploadFile(buffer);
    return res.status(200).json(imageName);
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
