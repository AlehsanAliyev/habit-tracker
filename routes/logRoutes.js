const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Habit = require('../models/Habit');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Show all logs (optional)
router.get('/', ensureAuthenticated, async (req, res) => {
  const logs = await Log.find({ user: req.session.user.id }).populate('habit').sort({ date: -1 });
  res.render('logs/logHistory', { title: 'Log History', logs });
});

// Show log form for a habit
router.get('/add/:habitId', ensureAuthenticated, async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.habitId, user: req.session.user.id });
  if (!habit) return res.status(404).send('Habit not found');
  res.render('logs/logHabit', { title: 'Log Habit', habit });
});

// Submit log
router.post('/add/:habitId', ensureAuthenticated, async (req, res) => {
  const { status } = req.body;
  const logDate = new Date().toISOString().split('T')[0];

  try {
    const existingLog = await Log.findOne({
      habit: req.params.habitId,
      user: req.session.user.id,
      date: logDate
    });

    if (existingLog) {
      // Optional: flash message or redirect with notice
      return res.send('You have already logged this habit for today.');
    }

    await Log.create({
      habit: req.params.habitId,
      user: req.session.user.id,
      date: logDate,
      status
    });

    res.redirect('/habits');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
