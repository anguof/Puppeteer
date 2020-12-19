const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: String,
  score: String,
});

module.exports = mongoose.model("Movie", movieSchema);
