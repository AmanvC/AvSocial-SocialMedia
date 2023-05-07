const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("../mailers/verify-account-mailer");
const crypto = require("crypto");

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
      message: "User created successfully.",
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
      return res.end(
        "<h1>Email verified successfully, please login to continue</h1>"
      );
    }
    return res.redirect("http://localhost:3000/login");
  } catch (err) {
    console.log(err);
    return res.end("<h1>Something Went Wrong!</h1>");
  }
};
