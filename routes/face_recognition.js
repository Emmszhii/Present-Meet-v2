const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const { Account, User, Student, Teacher } = require('../models/User');
const { comparePassword, faceApiThreshold } = require('./helpers/functions');

router.get('/face-recognition', ensureAuthenticated, (req, res) => {
  if (req.user.type === 'student') {
    res.render('face_recognition');
  } else {
    res.redirect('/');
  }
});

router.get('/get-descriptor', ensureAuthenticated, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id });
    if (!student)
      return res
        .status(200)
        .json({ warning: `Please register your face descriptor` });

    if (student.descriptor)
      return res.status(200).json({
        descriptor: student.descriptor,
        threshold: faceApiThreshold,
        msg: 'User face descriptor is now added',
      });
  } catch (e) {
    console.log(e);
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

    if (!booleanPassword)
      return res.status(400).json({ err: `Invalid Password` });

    Student.updateOne(
      { _id: req.user._id },
      {
        _id: req.user._id,
        descriptor: descriptor,
      },
      { upsert: true },
      (err) => {
        if (err) return res.status(400).json({ err });
        return res.status(200).json({ msg: `/` });
        // res.redirect('/');
      }
    );
  } catch (e) {
    console.log(e);
  }
});

router.get('/student-descriptor/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findOne({ _id: id });
    const user = await User.findOne({ _id: id });

    if (!student) return res.status(400).json({ err: `No student found` });
    if (!student.descriptor)
      return res.status(200).json({
        err: `Student ${user.last_name}, ${user.first_name} didn't registered their face descriptor in the database`,
      });

    if (student.descriptor) {
      return res
        .status(200)
        .json({ descriptor: student.descriptor, threshold: faceApiThreshold });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
