// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  //Tracks the user's proficiency. This will help in providing exercises based on the user’s level.
  languageLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },

  //this Map field holds the user’s progress percentage for each exercise type 
  //(reading, writing, listening, and speaking). It allows us to personalize practice.
  progress: {
    type: Map,
    of: Number, // Stores progress for each exercise type, e.g., { reading: 70, writing: 50 }
    default: { reading: 0, writing: 0, listening: 0, speaking: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
