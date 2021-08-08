const mongoose = require("mongoose")

const checklistSchema = new mongoose.Schema({
  name: String,
  questions: [{ checked: Boolean, term: String, _id: false }],
  userId: String
})

module.exports = mongoose.model("Checklist", checklistSchema)