// const mongoose = require('mongoose');

// const logSchema = new mongoose.Schema({
//   habit: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Habit',
//     required: true
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['completed', 'missed'],
//     default: 'completed'
//   }
// });

// module.exports = mongoose.model('Log', logSchema);
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'partial', 'off', 'missed'],
    required: true
  },
  score: {
    type: mongoose.Schema.Types.Mixed, // number or 'f' for off
    required: true
  }
});

module.exports = mongoose.model('Log', logSchema);
