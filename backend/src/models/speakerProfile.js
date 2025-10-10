// models/profile.js
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  title: String,
  organization: String,
  start: String, // format: dd/mm/yyyy
  end: String // format: dd/mm/yyyy

});

const educationSchema = new mongoose.Schema({
  levelOfEducation: String,
  organization: String,
  start: String, // format: dd/mm/yyyy
  end: String // format: dd/mm/yyyy
});

const awardSchema = new mongoose.Schema({
  title: String,
  organization: String,
  year: String // format: yyyy
});

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  bio: String,
  profileImage: {
    data: Buffer,
    contentType: String
  },
  about: String,
  skills: [String],
  experience: [experienceSchema],
  education: [educationSchema],
  awards: [awardSchema]
}, { timestamps: true });

const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);
export default Profile;