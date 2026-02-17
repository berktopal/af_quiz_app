const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  avatar: { type: String, required: true }, // avatar zorunlu
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Score', scoreSchema)
