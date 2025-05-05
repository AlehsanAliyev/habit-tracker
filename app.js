const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');

// Load environment variables
dotenv.config();

// Init app
const app = express();

// Connect to MongoDB
require('./config/db')();

// Middleware for form handling
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session and Flash
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

// Expose session and flash to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Handlebars helpers
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('ifEquals', (a, b, options) => a == b ? options.fn(this) : options.inverse(this));
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('json', context => JSON.stringify(context));

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/habits', require('./routes/habitRoutes'));
app.use('/logs', require('./routes/logRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
