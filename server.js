const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoute");
const profileRoutes = require("./routes/profileRoute");
const postRoutes = require("./routes/postRoute");
const connectionRoutes = require("./routes/connectionRoute");
const conversationRoutes = require("./routes/conversationRoute");
const messageRoutes = require("./routes/messageRoute");
const User = require("./models/userData");
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose
  .connect("mongodb://localhost/pro-finder")
  .then(async () => {
    console.log("Connected to MongoDB...");
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      await User.create({
        username: "Usama Mohsin",
        email: "usamamohsin1234@gmail.com",
        isAdmin: true,
      });
    }
  })
  .catch((err) => console.error("Could not connect to MongoDB...", err));
app.use("/", userRoutes);
app.use("/", profileRoutes);
app.use("/", postRoutes);
app.use("/", connectionRoutes);
app.use("/", conversationRoutes);
app.use("/", messageRoutes);
app.listen(3001, function () {
  console.log("Express server is running on port 3001!");
});
