const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Get today's tasks
router.get('/', ensureAuthenticated, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks = await Task.find({ user: req.session.user.id, date: today });
  res.render('tasks/index', { title: 'Today\'s Tasks', tasks });
});

// Add new task
router.post('/add', ensureAuthenticated, async (req, res) => {
  const { title } = req.body;
  await Task.create({
    user: req.session.user.id,
    title
  });
  res.redirect('/tasks');
});

// Toggle completion
router.post('/toggle/:id', ensureAuthenticated, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.session.user.id });
  if (task) {
    task.isCompleted = !task.isCompleted;
    await task.save();
  }
  res.redirect('/tasks');
});

// Delete task
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
  res.redirect('/tasks');
});

module.exports = router;
