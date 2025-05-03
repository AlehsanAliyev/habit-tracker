const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');

// Load environment variables
dotenv.config();

// Init app
const app = express();

// Connect to MongoDB
require('./config/db')();

// Middleware for form handling
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Session handling
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Make session available in views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Set up view engine (HBS)
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// ✅ Register Handlebars helpers
hbs.registerHelper('gt', function (a, b) {
  return a > b;
});

hbs.registerHelper('ifEquals', function (a, b, options) {
  return a == b ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/habits', require('./routes/habitRoutes'));
app.use('/logs', require('./routes/logRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
