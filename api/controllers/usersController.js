const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("../mailers/verify-account-mailer");
const crypto = require("crypto");
const Relationship = require("../models/Relationship");

module.exports.createSession = async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOne({ email: data.email }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist!",
      });
    }
    const checkPassword = await bcrypt.compare(data.password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password!",
      });
    }
    const { password, ...otherData } = user;
    if (otherData.status === "Pending") {
      nodeMailer.sendConfirmationEmail(
        otherData.firstName,
        otherData.lastName,
        otherData.email,
        otherData.confirmationCode
      );
    }
    return res.status(200).json({
      success: true,
      token: jwt.sign(otherData, process.env.JWT_KEY),
      status: user.status,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const data = req.body;
    if (data.email !== data.emailAgain) {
      return res.status(400).json({
        success: false,
        message: "Emails do not match!",
      });
    }
    if (data.password !== data.passwordAgain) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match!",
      });
    }
    const user = await User.findOne({ email: data.email });
    if (user) {
      return res.status(403).json({
        success: false,
        message:
          "User with given email ID already exists, please login to continue.",
      });
    }

    const confirmationCode = crypto.randomBytes(20).toString("hex");
    nodeMailer.sendConfirmationEmail(
      data.firstName,
      data.lastName,
      data.email,
      confirmationCode
    );
    // CREATE A NEW USER and Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      confirmationCode,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully. Please verify email to continue.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports.verifyUserEmail = async (req, res) => {
  try {
    let user = await User.findOne({
      confirmationCode: req.params.confirmationCode,
    });
    if (user && user.status === "Pending") {
      user.status = "Active";
      user.save();
      const avSocialMedia = await User.findOne({
        email: "media.avsocial@gmail.com",
      });
      if (avSocialMedia) {
        await Relationship.create({
          sentBy: user.id,
          sentTo: avSocialMedia.id,
          status: "Accepted",
        });
      }
      return res.end(
        `
        <!DOCTYPE html>
        <html lang="en">
          <body>
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
              }
            </style>
            <div
              style="
                height: 100vh;
                width: 100vw;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding-top: 200px;
                gap: 40px;
              "
            >
              <h1 style="color: rgb(158, 64, 64); font-size: 6em">AvSocial</h1>
              <h2 style="font-size: 3em; text-align: center">
                Email verified successfully, please
                <a
                  href="http://localhost:3000/login"
                  style="color: rgb(158, 64, 64); cursor: pointer"
                  >Login</a
                >
                to continue.
              </h2>
            </div>
          </body>
        </html>        
        `
      );
    }
    return res.redirect("http://localhost:3000/login");
  } catch (err) {
    console.log(err);
    return res.redirect("http://localhost:3000/login");
  }
};
