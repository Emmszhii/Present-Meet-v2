require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const passport = require('passport');
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
require('./config/passport')(passport); // Passport Config
const db = require('./config/keys').MongoURI; // DB config

// EJS
app.use(express.static('public'));
app.use('/public/', express.static('./public'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
); // express session

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      // the statement for performing our redirection
      return res.redirect('https://' + req.headers.host + req.url);
    } else return next();
  } else return next();
}); // force use https

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash()); // connect flash
app.use((req, res, next) => {
  if (!req.session.initialized) {
    req.session.initialized = true;
    req.session.loginAttempts = 0;
    req.session.rememberMe;
  }
  next();
}); // session global vars

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
}); // Global Vars

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/room'));
app.use('/', require('./routes/excel'));
app.use('/', require('./routes/face_recognition'));
app.use('/', require('./routes/class_attendance'));
app.use('/', require('./routes/room_attendance'));
app.use('/', require('./routes/forgot_password'));
app.use('/', require('./routes/redirect_to'));

app.use(function (req, res, next) {
  res.status(404).render('404', {
    title: '404 page not found',
    message: `Nothing can be found here`,
  });
}); // 404

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is up and listening on PORT ${PORT}`);
    });
    console.log(`MongoDB connected...`);
  })
  .catch((err) => {
    console.log(err);
  }); // Connection to MongoDB
