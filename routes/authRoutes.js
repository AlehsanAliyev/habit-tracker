// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 2 }).withMessage('Username must be at least 2 characters.'),
    body('email').trim().isEmail().withMessage('Enter a valid email.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
  ],
  handleValidation,
  authController.registerUser
);
// POST: Login user
router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Enter a valid email.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  handleValidation,
  authController.loginUser
);

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
