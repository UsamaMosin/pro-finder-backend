const express = require("express");
const router = express.Router();
const Connection = require("../models/connectionData");
const User = require("../models/userData");
const Conversation = require("../models/conversation");
const Profile = require("../models/profileData");

router.route("/getFriendsPic/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Connection.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Convert the user object to a plain JavaScript object
    const userObject = user.toObject();

    // Create an array to store the updated friends with profile_public_id
    const updatedFriends = [];

    // Loop through the friendIds and fetch profile_public_id for each friendId
    for (const friendIdObj of userObject.friendIds) {
      const friendId = friendIdObj.friendId;
      const profile = await Profile.findOne({ user: friendId });
      if (profile) {
        // If the profile is found, add the profile_public_id to the friend object
        friendIdObj.profile_public_id = profile.profile_public_id;
      }
      updatedFriends.push(friendIdObj);
    }

    // Replace the friendIds array in the user object with the updated array
    userObject.friendIds = updatedFriends;

    // Return the modified user object in the response
    res.json(updatedFriends);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
});

router.route("/getFriends/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Connection.findOne({ user: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve User" });
  }
});

router.route("/connection").get(async (req, res) => {
  try {
    const user_id = req.query.param1;
    const other_id = req.query.param2;

    const user = await Connection.findOne({ user: user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // const otherExist = user.friendIds.some(
    //   (friend) => friend.friendId.toString() === other_id
    // );
    // if (!otherExist) {
    //   return res.status(404).json({ error: "Other not found" });
    // }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve connection" });
  }
});

router.route("/connectionSend").put(async (req, res) => {
  try {
    const { user_id, friend_id, status } = req.body;

    const userForName = await User.findOne({ _id: user_id });
    const friendForName = await User.findOne({ _id: friend_id });
    const user = await Connection.findOne({ user: user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const friendExist = user.friendIds.some(
      (friend) => friend.friendId.toString() === friend_id
    );
    if (!friendExist && status === "pending") {
      user.friendIds.push({
        friendId: friend_id,
        status,
        username: friendForName.username,
        sendRequest: true,
      });
    } else if (friendExist && status === "connected") {
      const updatedFriendIds = user.friendIds.map((friend) => {
        if (friend.friendId.toString() === friend_id) {
          return { ...friend, status }; // Only update the 'status' property
        }
        return friend;
      });
      const newConversation = new Conversation({
        members: [user_id, friend_id],
      });
      const savedConversation = await newConversation.save();
      user.friendIds = updatedFriendIds;
    } else {
      const index = user.friendIds.findIndex(
        (friend) => friend.friendId.toString() === friend_id
      );
      if (index > -1) {
        user.friendIds.splice(index, 1); // Remove object from the array at the found index
      }
    }
    const updateUser = await user.save();

    const friendUser = await Connection.findOne({ user: friend_id });
    if (!friendUser) {
      return res.status(404).json({ error: "Friend not found" });
    }
    const userExist = friendUser.friendIds.some(
      (friend) => friend.friendId.toString() === user_id
    );
    if (!userExist && status === "pending") {
      friendUser.friendIds.push({
        friendId: user_id,
        status,
        username: userForName.username,
        sendRequest: false,
      });
    } else if (userExist && status === "connected") {
      const updatedFriendIds = friendUser.friendIds.map((friend) => {
        if (friend.friendId.toString() === user_id) {
          return { ...friend, status }; // Only update the 'status' property
        }
        return friend;
      });
      friendUser.friendIds = updatedFriendIds;
    } else {
      const index = friendUser.friendIds.findIndex(
        (friend) => friend.friendId.toString() === user_id
      );
      if (index > -1) {
        friendUser.friendIds.splice(index, 1); // Remove object from the array at the found index
      }
    }
    const updateFriendUser = await friendUser.save();

    res.status(200).json({ updateFriendUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create connection" });
  }
});

router.route("/connectionAccept").put(async (req, res) => {
  try {
    const { user_id, friend_id, status } = req.body;

    const userFriend = await User.findOne({ _id: friend_id });
    const user = await Connection.findOne({ user: user_id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const friendExist = user.friendIds.some(
      (friend) => friend.friendId.toString() === friend_id
    );
    if (!friendExist) {
      user.friendIds.push({
        friendId: friend_id,
        status,
        username: userFriend.username,
      });
    } else {
      const index = user.friendIds.findIndex(
        (friend) => friend.friendId.toString() === friend_id
      );
      if (index > -1) {
        user.friendIds.splice(index, 1); // Remove object from the array at the found index
      }
    }
    const updateUser = await user.save();

    const friendUser = await Connection.findOne({ user: friend_id });
    if (!friendUser) {
      return res.status(404).json({ error: "Friend not found" });
    }
    const userExist = friendUser.friendIds.some(
      (friend) => friend.friendId.toString() === user_id
    );
    if (!userExist) {
      friendUser.friendIds.push({
        friendId: user_id,
        status,
        username: user.username,
      });
    } else {
      const index = friendUser.friendIds.findIndex(
        (friend) => friend.friendId.toString() === user_id
      );
      if (index > -1) {
        friendUser.friendIds.splice(index, 1); // Remove object from the array at the found index
      }
    }
    const updateFriendUser = await friendUser.save();

    res.status(200).json({ updateFriendUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to create connection" });
  }
});

module.exports = router;
