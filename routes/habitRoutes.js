const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const calculateStreak = require('../utils/streakCalculator');
const Log = require('../models/Log');
const calculateHabitScore = require('../utils/scoreCalculator');
const SuggestedHabit = require('../models/SuggestedHabit');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Dashboard Route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.session.user.id }).sort({ createdAt: -1 });
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

    const habitsWithStats = await Promise.all(habits.map(async habit => {
      const logs = await Log.find({ habit: habit._id, user: req.session.user.id });
      const streak = calculateStreak(logs);

      let weeklyProgress = 0;
      const thisWeekLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfWeek && logDate <= today;
      });
      thisWeekLogs.forEach(log => {
        if (log.score === 2) weeklyProgress += 1;
        else if (log.score === 1) weeklyProgress += 0.5;
      });

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const log = logs.find(l => l.date.toISOString().split('T')[0] === dateStr);
        last7Days.push({
          date: dateStr,
          score: log ? log.score : null
        });
      }

      return {
        ...habit.toObject(),
        streak,
        weeklyProgress: +weeklyProgress.toFixed(1),
        weeklyTarget: habit.weeklyTarget || 4,
        last7Days
      };
    }));

    res.render('habits/dashboard', {
      title: 'Dashboard',
      habits: habitsWithStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

// Suggested Habits Route
router.get('/suggested', ensureAuthenticated, async (req, res) => {
  const suggestions = await SuggestedHabit.find();
  res.render('habits/suggestedList', { title: 'Suggested Habits', suggestions });
});

router.post('/add-from-suggestion', ensureAuthenticated, async (req, res) => {
  const { title, frequency } = req.body;

  try {
    const exists = await Habit.findOne({ user: req.session.user.id, title });

    if (exists) {
      req.flash('error', 'You already have this habit in your list.');
      return res.redirect('/habits');
    }

    await Habit.create({
      title,
      frequency,
      user: req.session.user.id
    });

    req.flash('success', 'Habit added successfully from suggestions!');
    res.redirect('/habits');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error adding suggested habit.');
    res.redirect('/habits');
  }
});

// Analytics Route
router.get('/analytics', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const range = req.query.range === '30' ? 30 : 7;
  const today = new Date();
  const fromDate = new Date();
  fromDate.setDate(today.getDate() - (range - 1));

  const habits = await Habit.find({ user: userId });
  let analytics = [];

  for (const habit of habits) {
    const allLogs = await Log.find({ habit: habit._id, user: userId }).sort({ date: 1 });

    let completionCount = 0;
    allLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate >= fromDate && logDate <= today) {
        if (log.score === 2) completionCount += 1;
        else if (log.score === 1) completionCount += 0.5;
      }
    });

    const stats = calculateHabitScore(allLogs);
    
    if (!stats) continue;

    analytics.push({
      title: habit.title,
      frequency: habit.frequency,
      completedDays: completionCount,
      percentage: Math.round((completionCount / range) * 100),
      streak: stats.streak,
      badge: stats.badge,
      averageScore: stats.average,
      scoreTrend: stats.scoreTrend,
      scoreTrendLabels: JSON.stringify(stats.scoreTrend.map(d => d.week)),
      scoreTrendValues: JSON.stringify(stats.scoreTrend.map(d => d.average)),
      heatmap: allLogs.map(log => ({
        date: log.date.toISOString().split('T')[0],
        score: log.score
      }))
    });
  }

  // Sort if requested
  const sortBy = req.query.sort || 'completion';
  if (sortBy === 'average') {
    analytics.sort((a, b) => b.averageScore - a.averageScore);
  } else if (sortBy === 'streak') {
    analytics.sort((a, b) => b.streak - a.streak);
  } else {
    analytics.sort((a, b) => b.percentage - a.percentage);
  }

  const labels = analytics.map(a => a.title);
  const data = analytics.map(a => a.percentage);

  const bestHabit = analytics.reduce((best, curr) => (curr.averageScore > (best?.averageScore || 0) ? curr : best), null);
  const worstHabit = analytics.reduce((worst, curr) => (curr.averageScore < (worst?.averageScore || 2) ? curr : worst), null);

  res.render('habits/analytics', {
    title: 'Analytics',
    analytics,
    range,
    rangeIs30: range === 30,
    labels: JSON.stringify(labels),
    data: JSON.stringify(data),
    bestHabit,
    worstHabit
  });
});

// Add Habit
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('habits/addHabit', { title: 'Add Habit' });
});

router.post('/add', ensureAuthenticated, async (req, res) => {
  const { title, frequency, weeklyTarget } = req.body;
  try {
    const newHabit = new Habit({
      title,
      frequency,
      weeklyTarget,
      user: req.session.user.id
    });
    await newHabit.save();
    res.redirect('/habits');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Edit Habit
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.session.user.id });
  if (!habit) return res.status(404).send('Habit not found');
  res.render('habits/editHabit', { title: 'Edit Habit', habit });
});

router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  const { title, frequency, weeklyTarget } = req.body;
  await Habit.findOneAndUpdate(
    { _id: req.params.id, user: req.session.user.id },
    { title, frequency, weeklyTarget }
  );
  res.redirect('/habits');
});

// Delete Habit
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
  await Habit.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
  res.redirect('/habits');
});

module.exports = router;
