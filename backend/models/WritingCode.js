// models/WritingCode.js
const mongoose = require("mongoose");

// Simplified WritingCode schema
const WritingCodeSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the writing test
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
  challenge1: { type: String, required: true }, // Question text for Exercise 1
  challenge2: { type: String, required: true }, // Question text for Exercise 2
  challenge3: { type: String, required: true }, // Question text for Exercise 3
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WritingCode", WritingCodeSchema);
