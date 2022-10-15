const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const { Account, User, Student, Teacher } = require('../models/User');
const { comparePassword } = require('./helpers/functions');

router.get('/face-recognition', ensureAuthenticated, (req, res) => {
  res.render('face_recognition');
});

router.get('/getDescriptor', ensureAuthenticated, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id });

    if (!student.descriptor)
      return res
        .status(200)
        .json({ warning: `Please register face recognition` });

    if (student.descriptor)
      return res.status(200).json({ descriptor: student.descriptor });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: e });
  }
});

router.post('/descriptor', ensureAuthenticated, async (req, res) => {
  const descriptor = req.body.descriptor;
  const password = req.body.password;

  if (descriptor.trim() === ``)
    return res.status(400).json({ err: 'Face is not valid' });
  if (password.trim() === ``)
    return res.status(400).json({ err: 'Password is invalid' });
  const float = descriptor.split(',');
  if (!descriptor) return res.status(400).json({ err: 'No Face detected' });
  if (float.length !== 128)
    return res.status(400).json({ err: 'Invalid Face' });

  try {
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) return res.status(400).json({ err: `Invalid request` });

    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      Student.updateOne(
        { _id: req.user._id },
        {
          _id: req.user._id,
          descriptor: descriptor,
        },
        { upsert: true },
        (err) => {
          if (err) return console.log(err);
          return res.status(200).json({ msg: `Successfully save to database` });
        }
      );
    } else {
      return res.status(400).json({ err: `Invalid Password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: e });
  }
});

module.exports = router;
