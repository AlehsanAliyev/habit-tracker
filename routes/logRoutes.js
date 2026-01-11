const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const Log = require('../models/Log');
const Habit = require('../models/Habit');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');

// Show all logs (optional)
router.get('/', ensureAuthenticated, async (req, res) => {
  const logs = await Log.find({ user: req.session.user.id }).populate('habit').sort({ date: -1 });
  res.render('logs/logHistory', { title: 'Log History', logs });
});


// Show log form for a habit
router.get('/add/:habitId', ensureAuthenticated, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      user: req.session.user.id
    });

    if (!habit) return res.status(404).send('Habit not found');

    res.render('logs/logHabit', {
      title: 'Log Habit',
      habit
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading log form');
  }
});

// Show log form for a habit
router.post(
  '/add/:habitId',
  ensureAuthenticated,
  [
    param('habitId').isMongoId().withMessage('Invalid habit id.'),
    body('status').isIn(['completed', 'partial', 'off', 'missed']).withMessage('Invalid status.')
  ],
  handleValidation,
  async (req, res) => {
  const { status } = req.body;
  const logDate = new Date().toISOString().split('T')[0];

  try {
    const existingLog = await Log.findOne({
      habit: req.params.habitId,
      user: req.session.user.id,
      date: logDate
    });

    if (existingLog) {
      return res.send('You have already logged this habit for today.');
    }

    let score;
    if (status === 'completed') score = 2;
    else if (status === 'partial') score = 1;
    else if (status === 'off') score = 'f'; // no score, but valid
    else score = 0;

    await Log.create({
      habit: req.params.habitId,
      user: req.session.user.id,
      date: logDate,
      status,
      score
    });

    res.redirect('/habits');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
