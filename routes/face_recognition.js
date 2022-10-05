const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const { Account, User, Student, Teacher } = require('../models/User');

router.get('/face-recognition', ensureAuthenticated, (req, res) => {
  res.render('face_recognition');
});

router.get('/getDescriptor', ensureAuthenticated, (req, res) => {
  Student.findOne({ account_id: req.user.account_id }, (err, data) => {
    console.log(data);
    if (err) return res.status(400).json({ err: err });
    if (!data)
      return res
        .status(400)
        .json({ err: `User don't have a registered face in the database!` });

    if (data.descriptor) {
      res.status(200).json({ descriptor: data.descriptor });
    } else {
      res
        .status(400)
        .json({ err: `User don't have a registered face in the database!` });
    }
  });
});

router.post('/descriptor', ensureAuthenticated, (req, res) => {
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

  Account.findOne({ _id: req.user.account_id }, (err, data) => {
    if (err) return res.status(400).json({ err: err });
    bcrypt.compare(password, data.password, (err, result) => {
      if (err) return res.status(400).json({ err: 'Password is incorrect!' });
      if (result) {
        Student.updateOne(
          { account_id: req.user.account_id },
          {
            account_id: req.user.account_id,
            descriptor: descriptor,
          },
          { upsert: true },
          (err) => {
            if (err) return console.log(err);
            res.status(200).json({ msg: `Successfully save to database` });
            console.log(`successfully updated the document`);
          }
        );
      } else {
        return res.status(400).json({ err: 'Password is incorrect!' });
      }
    });
  });
});

module.exports = router;
