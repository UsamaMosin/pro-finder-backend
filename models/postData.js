const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: true,
    },
    postArr: [
      {
        caption: String,
        public_id: String,
        like: {
          type: Number,
          default: 0,
        },
        userIds: [
          {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "User",
            autopopulate: true,
          },
        ],
        createdAt: {
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

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
