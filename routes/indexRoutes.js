const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
  // loads views/home.hbs
});

module.exports = router;
