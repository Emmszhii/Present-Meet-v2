const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { isEmail } = require('validator');
const { ensureAuthenticated } = require('../config/auth');
const {
  capitalize,
  generateHashPassword,
  comparePassword,
  validateEmpty,
} = require('./helpers/functions');

// User model
const { Account, User, Student, Teacher } = require('../models/User');

// Login Handle

router.get('/login', async (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
    console.log(req.user);
  } else {
    res.render('login');
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Handle
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

  // check if first_name is valid
  if (first_name < 3 || first_name.trim() === '') {
    errors.push({ msg: 'First name must contain at least 3 letters' });
  }
  if (middle_name < 3)
    errors.push({ msg: `Middle name must contain at least 3 or more letters` });
  if (middle_name.trim() === '') errors.push({ msg: `Middle name is empty` });
  // check if last_name is valid
  if (last_name < 3 || last_name.trim() === '') {
    errors.push({ msg: 'Last name must contain at least 3 letter' });
  }
  // check if birthday is not null
  if (birthday.trim() === '') {
    errors.push({ msg: 'Must input a birthday' });
  }
  // check if type is not null and valid
  if (
    type.trim() === '' &&
    type !== 'student' &&
    type !== 'teacher' &&
    type !== 'audience' &&
    type !== 'host'
  ) {
    res.status(400).json({ msg: 'Please input a valid account type' });
  }
  // check if email is valid
  if (!isEmail(email)) {
    errors.push({ msg: 'Email is not valid' });
  }
  if (password !== password2) {
    // check password match
    errors.push({ msg: 'Passwords do not much' });
  }
  // check pass length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      first_name,
      last_name,
      birthday,
      type,
      email,
      password,
      password2,
    });
  } else {
    const account = await Account.findOne({ email: email });
    console.log(account);

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
          console.log(data);
          req.flash('success_msg', 'You are now Registered and can log in');
          res.redirect('/login');
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
});

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
router.post('/profile', ensureAuthenticated, (req, res) => {
  console.log(req.body);
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

  Account.findOne({ _id: req.user._id }, (err, data) => {
    if (err) res.status(400).json({ err });
    bcrypt.compare(password, data.password, (err, result) => {
      if (err) return res.status(200).json({ err: err });
      if (result) {
        const data = {
          first_name: capitalize(first_name),
          middle_name: capitalize(middle_name),
          last_name: capitalize(last_name),
          birthday: birthday,
          type: type,
        };

        User.updateOne({ _id: req.user._id }, data, (error, result) => {
          if (error) return res.status(200).json({ err: error });
          console.log(result.acknowledged);
          if (result.acknowledged) {
            return res.status(200).json({ msg: 'User info has been updated' });
          } else {
            return res.status(400).json({ err: 'Something gone wrong' });
          }
        });
      } else {
        return res.status(400).json({ err: 'Invalid Password' });
      }
    });
  });
});

router.post('/password', ensureAuthenticated, (req, res) => {
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

  Account.findOne({ _id: req.user._id }, (err, data) => {
    if (err) res.status(400).json({ err });
    console.log(data);

    bcrypt.compare(oldPw, data.password, (err, result) => {
      if (err)
        return res.status(400).json({ err: 'Old Password is incorrect' });

      if (result) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) return res.status(400).json({ err: 'Something gone wrong' });
          bcrypt.hash(newPw, salt, (err, hash) => {
            if (err)
              return res.status(400).json({ err: 'Something gone wrong' });

            Account.updateOne(
              { _id: req.user._id },
              { password: hash },
              (error, result) => {
                if (error)
                  return res.status(400).json({ err: 'Something gone wrong' });
                if (result) {
                  return res
                    .status(200)
                    .json({ msg: 'Password have been changed!' });
                }
              }
            );
          });
        });
      }
    });
  });
});

// Logout Handle
router.get('/logout', (req, res) => {
  req.logout((err) => {
    req.flash('success_msg', 'Your are logged out');
    res.redirect('/login');
  });
});

module.exports = router;
