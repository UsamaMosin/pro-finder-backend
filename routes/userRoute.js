const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/userData");
const Connection = require("../models/connectionData");
const nodemailer = require("nodemailer");
const Connections = require("../models/connectionData");
router.get("/", (req, res) => {
  res.json({});
});
router.route("/register").post(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(422).json({ error: "Please Fill the Field Properly" });
  }
  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email Already Exisits!!!" });
    } else {
      const user = new User({ username, email, password });
      await user.save();
      const userConnection = new Connection({
        user: user._id,
      });
      await userConnection.save();
      res.send(user);
      res.status(201).json({ message: "User Entered Successfully!!!" });
    }
  } catch (err) {
    //console.log(err);
  }
});
//login route
router.route("/login").post(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(422).json({ error: "Please Enter Email" });
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(422).json({ message: "Invalid Email Format" });
  }
  try {
    const userLogin = await User.findOne({ email });
    if (userLogin) {
      res.send(userLogin);
      res.status(201).json({ message: "Correct Email!!!" });
    } else
      res
        .status(400)
        .json({ message: "User not exist. Please craete an account." });
  } catch (err) {
    console.log(err);
  }
});
router.route("/login/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
});
router.route("/search").get(async (req, res) => {
  const { query } = req.query;
  try {
    // Search for usernames that start with the query
    const users = await User.find({
      username: { $regex: `^${query}`, $options: "i" },
    }).limit(10);
    res.json(users);
  } catch (error) {
    console.error("Error searching for usernames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//get all users
router.route("/getUser/:userId").get(async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
});
//get all users
router.route("/getAllUsers").get(async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    if (!users) {
      return res.status(404).json({ error: "Users not found" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve Users" });
  }
});

router.route("/deleteUser/:userId").delete(async (req, res) => {
  try {
    const userId = req.params.userId;

    const deletedUser = await User.findByIdAndDelete(userId);
    const delUserConnection = await Connections.findOneAndDelete({
      user: userId,
    });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete User" });
  }
});
//sendKey Route
router.route("/sendKey").post(async (req, res) => {
  console.log(req.body);
  const { to, subject, description } = req.body;
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "qureshinouman30@gmail.com",
      pass: "dcihugbcmleaidoy",
    },
  });

  let mailDetails = {
    from: "qureshinouman30@gmail.com",
    to: to,
    subject: subject,
    text: "OK",
    html: `<div>${description}</div>`,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err.message);
      console.log("Error Occurs");
      res.status(400).json({ message: "ERROR" });
    } else {
      res.status(400).json({ message: "Email sent successfully" });
      console.log("Email sent successfully");
    }
  });
});

//compare Password route
router.route("/comparePassword").post(async (req, res) => {
  const { email, password } = req.body;
  const userLogin = await User.findOne({ email });
  const pswrd = await bcrypt.compare(password, userLogin.password);
  res.send(pswrd);
});
module.exports = router;
