const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    profile_public_id: String,
    cover_public_id: String,
    bio: String,
    username: String,
    about: {
      type: String,
      minlength: 10,
    },
    address: {
      type: {
        city: String,
        country: String,
      },
    },
    education: {
      type: [
        {
          schoolName: String,
          degree: String,
          field: String,
          startDate: {
            month: String,
            year: String,
          },
          endDate: {
            month: String,
            year: String,
          },
          description: String,
        },
      ],
    },
    experience: {
      type: [
        {
          companyName: String,
          position: String,
          extraCommment: String,
          startDate: {
            month: String,
            year: String,
          },
          endDate: {
            month: String,
            year: String,
          },
          description: String,
        },
      ],
    },
    skills: {
      type: [
        {
          name: String,
          description: String,
        },
      ],
    },
    language: Array,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      autopopulate: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;
