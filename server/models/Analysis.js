const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: String,
  score: Number,
  missing_skills: [String],
  suggestions: [String],
  summary: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analysis", analysisSchema);
