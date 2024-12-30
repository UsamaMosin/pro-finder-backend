const express = require("express");
const router = express.Router();
const Profile = require("../models/profileData");
const User = require("../models/userData");

router.route("/profile").post(async (req, res) => {
  try {
    const {
      profile_public_id,
      cover_public_id,
      bio,
      about,
      address,
      education,
      skills,
      experience,
      language,
      user,
    } = req.body;

    const userDoc = await User.findOne({ _id: user });

    const profile = new Profile({
      profile_public_id,
      cover_public_id,
      bio,
      username: userDoc.username,
      about,
      address,
      education,
      experience,
      skills,
      language,
      user,
    });
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to create profile" });
  }
});

router.route("/profile/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

router.route("/profile/:userId").put(async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      profile_public_id,
      cover_public_id,
      bio,
      about,
      address,
      education,
      experience,
      skills,
      language,
    } = req.body;

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (profile_public_id) {
      profile.profile_public_id = profile_public_id;
    }

    if (cover_public_id) {
      profile.cover_public_id = cover_public_id;
    }

    if (bio) {
      profile.bio = bio;
    }

    if (about) {
      profile.about = about;
    }

    if (address) {
      profile.address = address;
    }

    if (education) {
      profile.education = education;
    }

    if (experience) {
      profile.experience = experience;
    }

    if (skills) {
      profile.skills = skills;
    }

    if (language) {
      profile.language = language;
    }

    const updatedProfile = await profile.save();

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});
router.route("/profile/:id").patch(async (req, res) => {
  try {
    const { id } = req.params; // Get the profile ID from the URL parameters

    // Find the profile by ID
    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Extract the fields to be deleted from the request body
    const {
      profilePic,
      coverPic,
      bio,
      about,
      address,
      educationIndex,
      skillIndex,
      languageIndex,
    } = req.body;

    // Delete the specified fields
    if (coverPic) {
      profile.coverPic = undefined;
    }

    if (profilePic) {
      profile.profilePic = undefined;
    }

    if (bio) {
      profile.bio = undefined;
    }

    if (about) {
      profile.about = undefined;
    }

    if (address) {
      profile.address = undefined;
    }

    if (typeof educationIndex === "number") {
      profile.education.splice(educationIndex, 1);
    }

    if (typeof skillIndex === "number") {
      profile.skills.splice(skillIndex, 1);
    }

    if (typeof languageIndex === "number") {
      profile.language.splice(languageIndex, 1);
    }

    // Save the updated profile
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.route("/check").post(async (req, res) => {
  try {
    const { user } = req.body; // Get the user ID from the request body
    // Check if a profile exists for the given user ID
    const profileExists = await Profile.findOne({ user });
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
