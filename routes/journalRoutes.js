const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Show all journals
router.get('/', ensureAuthenticated, async (req, res) => {
  const entries = await Journal.find({ user: req.session.user.id }).sort({ date: -1 });
  res.render('journal/index', { title: 'My Journal', entries });
});

// Add
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('journal/form', { title: 'New Journal Entry' });
});

router.post('/add', ensureAuthenticated, async (req, res) => {
  const { morningNote, eveningNote } = req.body;
  await Journal.create({
    user: req.session.user.id,
    morningNote,
    eveningNote
  });
  res.redirect('/journal');
});

// Edit
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const entry = await Journal.findOne({ _id: req.params.id, user: req.session.user.id });
  if (!entry) return res.status(404).send('Not found');
  res.render('journal/form', { title: 'Edit Journal Entry', entry });
});

router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
  const { morningNote, eveningNote } = req.body;
  await Journal.findOneAndUpdate(
    { _id: req.params.id, user: req.session.user.id },
    { morningNote, eveningNote }
  );
  res.redirect('/journal');
});

// Delete
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
  await Journal.findOneAndDelete({ _id: req.params.id, user: req.session.user.id });
  res.redirect('/journal');
});

module.exports = router;
