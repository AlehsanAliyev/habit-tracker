const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');
const flash = require('connect-flash');


dotenv.config();


const app = express();

require('./config/db')();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware for form handling
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  ['body', 'params', 'query'].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});


app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 60 * 60 * 24 * 14
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(flash());

app.use(csrf());

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.csrfToken = req.csrfToken();
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

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    if (req.accepts('json')) {
      return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
    }
    req.flash('error', 'Invalid or missing CSRF token.');
    return res.status(403).redirect('back');
  }
  return next(err);
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
