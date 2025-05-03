const mongoose = require('mongoose');

const suggestedHabitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // the admin
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SuggestedHabit', suggestedHabitSchema);
