const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const Habit = require('../models/Habit');
const { ensureAdmin } = require('../middleware/authMiddleware');
const SuggestedHabit = require('../models/SuggestedHabit');
const { handleValidation } = require('../middleware/validate');

const Log = require('../models/Log');

router.get('/analytics', ensureAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalLogs = await Log.countDocuments();

  // Aggregate logs grouped by user
  const rawTopUsers = await Log.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Fetch usernames for each _id
  const topUsers = await Promise.all(
    rawTopUsers.map(async (item) => {
      const user = await User.findById(item._id);
      return {
        username: user ? user.username : 'Unknown',
        count: item.count,
        id: item._id
      };
    })
  );

  res.render('admin/adminAnalytics', {
    title: 'Admin Analytics',
    totalUsers,
    totalLogs,
    topUsers
  });
});

// View suggested habits
router.get('/suggested', ensureAdmin, async (req, res) => {
  const suggestions = await SuggestedHabit.find();
  res.render('admin/suggestedHabits', { title: 'Suggested Habits', suggestions });
});

// Add new suggestion
router.get('/suggested/new', ensureAdmin, (req, res) => {
  res.render('admin/newSuggestedHabit', { title: 'New Suggested Habit' });
});

router.post(
  '/suggested/new',
  ensureAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency.')
  ],
  handleValidation,
  async (req, res) => {
  const { title, frequency } = req.body;
  await SuggestedHabit.create({
    title,
    frequency,
    createdBy: req.session.user.id
  });
  res.redirect('/admin/suggested');
});

// Admin dashboard - list users
router.get('/', ensureAdmin, async (req, res) => {
  const users = await User.find();
  res.render('admin/adminPanel', { title: 'Admin Panel', users });
});

// View habits of a specific user
router.get('/user/:id/habits', ensureAdmin, [
  param('id').isMongoId().withMessage('Invalid user id.')
], handleValidation, async (req, res) => {
  const user = await User.findById(req.params.id);
  const habits = await Habit.find({ user: user._id });
  res.render('admin/userHabits', { title: `${user.username}'s Habits`, user, habits });
});

module.exports = router;
