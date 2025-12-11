// models/Journal.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  morningNote: String,
  eveningNote: String
}, { timestamps: true });

module.exports = mongoose.model('Journal', journalSchema);
