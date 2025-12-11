const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('Email already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user'  // default role
    });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.send('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid email or password');

    // Set session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };


    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/habits');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

  