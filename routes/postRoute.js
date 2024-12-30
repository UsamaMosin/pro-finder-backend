const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const path = require("path");
const Post = require("../models/postData");
const Connections = require("../models/connectionData");
const Profile = require("../models/profileData");

// POST /api/posts - Create a new post
router.post("/post", async (req, res) => {
  try {
    const { caption, public_id, user } = req.body;
    // Save the post data to the database
    const post = new Post({
      user,
      postArr: [
        {
          caption,
          public_id,
        },
      ],
    });
    const savedPost = await post.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create a new post" });
  }
});

router.route("/postLike").put(async (req, res) => {
  try {
    const { post_id, public_id, user_id } = req.body;
    // Save the post data to the database
    const postUser = await Post.findById(post_id);
    if (!postUser) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postUser.postArr.find(
      (postItem) => postItem.public_id === public_id
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure that the like field is a valid number
    if (isNaN(post.like)) {
      post.like = 0;
    }

    const isLiked = post.userIds.includes(user_id);

    if (!isLiked) {
      post.like += 1;
      post.userIds.push(user_id); // Add user_id to the array
    } else {
      if (post.like > 0) {
        post.like -= 1;
      }
      const index = post.userIds.indexOf(user_id);
      if (index > -1) {
        post.userIds.splice(index, 1); // Remove user_id from the array
      }
    }

    const updatedPostUser = await postUser.save();

    res.status(200).json(updatedPostUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create a new post" });
  }
});

router.route("/post/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.findOne({ user: userId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Now, retrieve the associated user's profile
    const userProfile = await Profile.findOne(
      { user: userId },
      "username profile_public_id"
    );

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Create an array of transformed post objects
    const transformedPosts = post.postArr.map((postObj) => ({
      _id: post._id,
      username: userProfile.username,
      profile_public_id: userProfile.profile_public_id,
      postArr: [postObj],
    }));

    res.json(transformedPosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve post and user profile" });
  }
});

router.get("/posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Get the friend IDs from the connections table
    const connections = await Connections.findOne({ user: userId });

    if (!connections) {
      return res
        .status(404)
        .json({ error: "No connections found for the given user ID." });
    }

    const friendIdsArray = connections.friendIds.map(
      (friend) => friend.friendId
    );
    friendIdsArray.push(ObjectId(userId));

    // Step 2: Get posts for the obtained friend IDs
    const posts = await Post.aggregate([
      {
        $match: { user: { $in: friendIdsArray } },
      },
      {
        $lookup: {
          from: "users", // Replace 'users' with the actual name of your 'user' table
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "profiles", // Replace 'users' with the actual name of your 'user' table
          localField: "user",
          foreignField: "user",
          as: "profileData",
        },
      },
    ]);

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ error: "No posts found for the given friend IDs." });
    }
    // Step 3: Transform each object in postArr to a separate post object
    const transformedPosts = [];
    posts.forEach((post) => {
      const userData = post.userData[0];
      const profileData = post.profileData[0];

      post.postArr.forEach((postArrObj) => {
        transformedPosts.push({
          _id: post._id,
          username: userData.username,
          profile_public_id: profileData.profile_public_id,
          postArr: [postArrObj],
        });
      });
    });

    res.status(200).json(transformedPosts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

router.put("/post/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { caption, public_id } = req.body;

    // Find the post by the user ID
    const post = await Post.findOne({ user: userId });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    /// Create a new post object to be added to postArr
    const newPost = {};

    if (caption) {
      newPost.caption = caption;
    }

    if (public_id) {
      newPost.public_id = public_id;
    }

    // Add the new post object to postArr
    post.postArr.push(newPost);

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update post" });
  }
});
router.route("/checkPost").post(async (req, res) => {
  try {
    const { user } = req.body; // Get the user ID from the request body
    // Check if a profile exists for the given user ID
    const profileExists = await Post.findOne({ user });
    if (profileExists) {
      res.status(200).json(true);
    } else {
      res.status(200).json(false);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to check profile existence" });
  }
});
module.exports = router;
