const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  date: { type: Date, default: () => new Date().setHours(0,0,0,0) } // Daily grouping
});

module.exports = mongoose.model('Task', taskSchema);
