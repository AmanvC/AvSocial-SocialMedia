const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.createSession = async (req, res) => {
  try {
    const data = req.body;
    const user = await User.findOne({ email: data.email }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    const checkPassword = bcrypt.compareSync(data.password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password!",
      });
    }
    const { password, ...otherData } = user;
    return res.status(200).json({
      success: true,
      token: jwt.sign(otherData, "secretkey"),
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
    // CREATE A NEW USER and Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
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
