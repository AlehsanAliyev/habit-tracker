const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');


dotenv.config();


const app = express();

require('./config/db')();

// Middleware for form handling
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(flash());


app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});


app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { layout: 'layouts/main' });
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));


hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('ifEquals', (a, b, options) => a == b ? options.fn(this) : options.inverse(this));
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('json', context => JSON.stringify(context));
hbs.registerHelper('mod', function (index, modValue) {
  return index % modValue === 0;
});


app.use('/', require('./routes/indexRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/habits', require('./routes/habitRoutes'));
app.use('/logs', require('./routes/logRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/journal', require('./routes/journalRoutes'));
app.use('/tasks', require('./routes/taskRoutes'));



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
