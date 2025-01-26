// models/Score.js
const mongoose = require("mongoose");

//The Score model tracks the user's performance on exercises, 
//helping personalize the learning experience by focusing on areas where they need improvement.

const scoreSchema = new mongoose.Schema({

    //Reference the User and Exercise collections, 
    //tracking which user attempted which exercise. This is MongoDB’s equivalent of a foreign key.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },

  type: { type: String, enum: ["reading", "writing", "listening", "speaking"], required: true },

  //Holds the user’s score for the exercise. This data can be used to track progress over time.
  score: { type: Number, required: true }, // e.g., score out of 100
  attemptDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Score", scoreSchema);
