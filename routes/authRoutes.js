// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', authController.registerUser);
// POST: Login user
router.post('/login', authController.loginUser);

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});
// TEMP: Promote user to admin (dev only)
// router.get('/promote/:id', async (req, res) => {
//   await User.findByIdAndUpdate(req.params.id, { role: 'admin' });
//   res.send('User promoted to admin.');
// });


module.exports = router;
