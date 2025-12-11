const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  weeklyTarget: {
    type: Number,
    default: null 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Habit', habitSchema);
