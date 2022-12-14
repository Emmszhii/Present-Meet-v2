const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Account, User } = require('../models/User'); // Load User Model

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match User
      Account.findOne({ email: email })
        .then((user) => {
          // up line is the user in the database
          // if user not found
          if (!user) {
            return done(null, false, {
              message: 'Email or password is incorrect',
            });
          }

          // Match the password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            // if somethings error
            if (err) throw err;
            // if match
            if (isMatch) {
              return done(null, user);
            } else {
              // if not password is incorrect
              return done(null, false, {
                message: 'Email or password is incorrect.',
              });
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id }, (err, user) => {
      done(err, user);
    });
  });
};
