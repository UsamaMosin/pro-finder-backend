const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userScheme = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: {
      type: String,
      trim: true,
      minlength: 8,
      private: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// userScheme.methods.isPsswordMatch = async function (password) {
//   const user = this;
//   return bcrypt.compare(password, user.password);
// };

userScheme.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userScheme);
module.exports = User;
