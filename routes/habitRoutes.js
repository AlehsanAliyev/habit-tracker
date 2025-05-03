const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const calculateStreak = require('../utils/streakCalculator');
const Log = require('../models/Log');

const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Dashboard (already working)
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.session.user.id }).sort({ createdAt: -1 });

    // Attach streak to each habit
    const habitsWithStreaks = await Promise.all(habits.map(async habit => {
      const logs = await Log.find({ habit: habit._id, user: req.session.user.id });
      const streak = calculateStreak(logs);
      return { ...habit.toObject(), streak };
    }));

    res.render('habits/dashboard', {
      title: 'Dashboard',
      habits: habitsWithStreaks
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});
router.get('/analytics', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const range = req.query.range === '30' ? 30 : 7;

  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - (range - 1));

  const habits = await Habit.find({ user: userId });
  const analytics = [];

  for (const habit of habits) {
    const logs = await Log.find({
      habit: habit._id,
      user: userId,
      date: { $gte: fromDate, $lte: today },
      status: 'completed'
    });

    const completionCount = logs.length;

    analytics.push({
      title: habit.title,
      frequency: habit.frequency,
      completedDays: completionCount,
      percentage: Math.round((completionCount / range) * 100)
    });
  }

  // ✅ Separate data for Chart.js
  const labels = analytics.map(a => a.title);
  const data = analytics.map(a => a.percentage);

  res.render('habits/analytics', {
    title: 'Analytics',
    analytics,
    range,
    labels: JSON.stringify(labels),
    data: JSON.stringify(data)
  });
});





// Add habit form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('habits/addHabit', { title: 'Add Habit' });
});

// Add habit POST
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { title, frequency } = req.body;
  try {
    const newHabit = new Habit({
      title,
      frequency,
      user: req.session.user.id
    });
    await newHabit.save();
    res.redirect('/habits');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET: Edit form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.session.user.id });
  if (!habit) return res.status(404).send('Habit not found');
  res.render('habits/editHabit', { title: 'Edit Habit', habit });
});

// POST: Update habit
router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  const { title, frequency } = req.body;
  await Habit.findOneAndUpdate(
    { _id: req.params.id, user: req.session.user.id },
    { title, frequency }
  );
  res.redirect('/habits');
});
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
  await Habit.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
  res.redirect('/habits');
});


module.exports = router;
