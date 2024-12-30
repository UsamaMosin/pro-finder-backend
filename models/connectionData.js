const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: true,
    },
    friendIds: [
      {
        friendId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "User",
          autopopulate: true,
        },
        status: {
          type: String,
        },
        username: {
          type: String,
        },
        sendRequest: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Set the default value to the current time
        },
        updatedAt: {
          type: Date,
          default: Date.now, // Set the default value to the current time
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Connections = mongoose.model("Connections", connectionSchema);

module.exports = Connections;
