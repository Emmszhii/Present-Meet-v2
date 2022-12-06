const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { isEmail } = require('validator');
const { ensureAuthenticated } = require('../config/auth');
const {
  capitalize,
  generateHashPassword,
  comparePassword,
  validateEmpty,
} = require('./helpers/functions');

const {
  Account,
  userSchema,
  User,
  Student,
  Teacher,
} = require('../models/User'); // User model

userSchema.plugin(passportLocalMongoose); // passport local mongoose

router.get('/login', async (req, res) => {
  req.isAuthenticated() ? res.redirect('/') : res.render('login');
}); // Login Handle

const checkAttempts = (req, res, next) => {
  req.session.loginAttempts++;
  const attempts = req.session.loginAttempts;
  if (attempts > 3) {
    req.session.loginAttempts = 0;
    return res.redirect('/forgot-password');
  }
  next();
}; //count login attempts

router.post(
  '/login',
  checkAttempts,
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    keepSessionInfo: true,
  }),
  (req, res) => {
    let redirectTo = `/`;
    if (req.session.reqUrl) {
      redirectTo = req.session.reqUrl;
      req.session.reqUrl = null;
    }
    res.redirect(redirectTo);
  }
);

router.get('/register', (req, res) => res.render('register')); // register page

router.post('/register', async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    email,
    password,
    password2,
    birthday,
    type,
  } = req.body;

  const errors = [];
  // check required fields
  if (validateEmpty(first_name)) errors.push({ msg: `First name is empty` });
  if (validateEmpty(middle_name)) errors.push({ msg: `Middle name is empty` });
  if (validateEmpty(last_name)) errors.push({ msg: `Last name is empty` });
  if (validateEmpty(birthday)) errors.push({ msg: `Birthday is empty` });
  if (validateEmpty(type)) errors.push({ msg: `Account type is empty` });
  if (validateEmpty(email)) errors.push({ msg: `email is empty` });
  if (validateEmpty(password)) errors.push({ msg: `Password is empty` });

  if (first_name < 3 || first_name.trim() === '')
    errors.push({ msg: 'First name must contain at least 3 letters' }); // check if first_name is valid
  if (middle_name < 3)
    errors.push({ msg: `Middle name must contain at least 3 or more letters` });
  if (middle_name.trim() === '') errors.push({ msg: `Middle name is empty` });
  if (last_name < 3 || last_name.trim() === '')
    errors.push({ msg: 'Last name must contain at least 3 letter' }); // check if last_name is valid

  if (birthday.trim() === '') errors.push({ msg: 'Must input a birthday' }); // check if birthday is not null

  if (
    type.trim() === '' &&
    type !== 'student' &&
    type !== 'teacher' &&
    type !== 'audience' &&
    type !== 'host'
  )
    res.status(400).json({ msg: 'Please input a valid account type' }); // check if type is not null and valid

  if (!isEmail(email)) errors.push({ msg: 'Email is not valid' }); // check if email is valid

  if (password !== password2) errors.push({ msg: 'Passwords do not much' }); // check password match

  if (password.length < 6)
    errors.push({ msg: 'Password should be at least 6 characters' }); // check pass length

  if (errors.length > 0) {
    res.render('register', {
      errors,
      first_name,
      middle_name,
      last_name,
      birthday,
      type,
      email,
      password,
      password2,
    });
  } else {
    const account = await Account.findOne({ email: email });

    if (account) {
      errors.push({ msg: `Email is already registered` });
      res.render('register', {
        errors,
        first_name,
        middle_name,
        last_name,
        birthday,
        type,
        email,
        password,
        password2,
      });
    } else {
      const fname = capitalize(first_name);
      const mname = capitalize(middle_name);
      const lname = capitalize(last_name);

      try {
        const hash = await generateHashPassword(password);
        const new_account = new Account({
          email,
          password: hash,
        });
        const accountUser = await new_account.save();
        const new_user = new User({
          _id: accountUser._id,
          first_name: fname,
          middle_name: mname,
          last_name: lname,
          birthday,
          type,
        });

        await new_user.save().then((data) => {
          req.flash('success_msg', 'You are now Registered and can log in');
          passport.authenticate('local')(req, res, () => {
            if (data.type === 'student') {
              res.redirect('face-recognition');
            } else {
              res.redirect('class-attendance');
            }
          });
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}); // Register Handle

// profile get request
router.get('/profile', ensureAuthenticated, (req, res) => {
  const { first_name, middle_name, last_name, birthday, type } = req.user;
  res.render('profile', {
    first_name,
    middle_name,
    last_name,
    birthday,
    type,
  });
});

// profile post request
router.post('/profile', ensureAuthenticated, async (req, res) => {
  const { first_name, middle_name, last_name, birthday, type, password } =
    req.body;
  if (
    !first_name ||
    !middle_name ||
    !last_name ||
    !birthday ||
    !type ||
    !password
  )
    return res
      .status(400)
      .json({ err: 'Please fill in all the required fields' });

  // check if first_name is valid
  if (first_name < 3 || first_name.trim() === '')
    return res
      .status(400)
      .json({ err: 'First name must contain at least 3 letters' });

  if (middle_name < 3)
    return res
      .status(400)
      .json({ err: `Middle name must contain at least 3 or more letters` });
  if (middle_name.trim() === ``)
    return res.status(400).json({ err: `Middle name is empty` });

  // check if last_name is valid
  if (last_name < 3 || last_name.trim() === '')
    return res
      .status(400)
      .json({ err: 'Last name must contain at least 3 letter' });

  // check if birthday is not null
  if (birthday.trim() === '')
    return res.status(400).json({ err: 'Must input a birthday' });

  // check if type is not null
  if (type.trim() === '' && type !== 'student' && type !== 'teacher')
    return res.status(400).json({ err: 'Please input a valid account type' });

  try {
    const data = {
      first_name: capitalize(first_name),
      middle_name: capitalize(middle_name),
      last_name: capitalize(last_name),
      birthday: birthday,
      type: type,
    };

    const account = await Account.findOne({ _id: req.user._id });
    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      User.updateOne({ _id: req.user._id }, data, (error, result) => {
        if (error) return res.status(400).json({ err: error });
        if (result.acknowledged)
          return res.status(200).json({ msg: 'User info has been updated' });
        if (!result.acknowledged)
          return res.status(400).json({ err: 'Something gone wrong' });
      });
    } else {
      return res.status(400).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: `Something went wrong` });
  }
});

router.post('/password', ensureAuthenticated, async (req, res) => {
  const {
    password: oldPw,
    newPassword: newPw,
    newPassword1: newPw1,
  } = req.body;
  if (!oldPw || !newPw || !newPw1)
    return res
      .status(400)
      .json({ err: 'All fields in password are required!' });
  if (newPw < 6)
    return res
      .status(400)
      .json({ err: 'Password must contain 6 or more characters!' });
  if (newPw !== newPw1)
    return res
      .status(400)
      .json({ err: 'New Password and confirm password is not the same!' });

  const account = await Account.findOne({ _id: req.user._id });
  if (!account) return res.status(200).json({ err: 'Invalid request' });

  const booleanPassword = await comparePassword(oldPw, account.password);
  if (booleanPassword) {
    try {
      const hash = await generateHashPassword(newPw);
      Account.updateOne(
        { _id: req.user._id },
        { password: hash },
        (error, result) => {
          if (error) res.status(400).json({ err: 'Something went wrong' });
          if (result.acknowledged) {
            return res.status(200).json({ msg: `Password has been changed` });
          }
        }
      );
    } catch (e) {
      console.log(e);
      return res.status(400).json({ err: `Something gone wrong` });
    }
  }
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    req.flash('success_msg', 'Your are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
