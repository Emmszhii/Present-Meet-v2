const bcrypt = require('bcrypt');
const passport = require('passport');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const {
  capitalize,
  generateHashPassword,
  comparePassword,
  validateEmpty,
} = require('../helpers/functions.js');

const { Account, User } = require('../../models/User.js'); // User model

const registerPage = (req, res) => res.render('register');

const registerPost = async (req, res) => {
  let {
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
  if (validateEmpty(middle_name)) middle_name = '';
  if (validateEmpty(last_name)) errors.push({ msg: `Last name is empty` });
  if (validateEmpty(birthday)) errors.push({ msg: `Birthday is empty` });
  if (validateEmpty(type)) errors.push({ msg: `Account type is empty` });
  if (validateEmpty(email)) errors.push({ msg: `email is empty` });
  if (validateEmpty(password)) errors.push({ msg: `Password is empty` });

  if (first_name < 3 || first_name.trim() === '')
    errors.push({ msg: 'First name must contain at least 3 letters' }); // check if first_name is valid
  // if (!middle_name.trim() === '' && middle_name < 3)
  //   errors.push({ msg: `Middle name must contain at least 3 or more letters` });
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
};

module.exports = { registerPage, registerPost };
