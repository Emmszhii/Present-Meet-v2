const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');
const Class = require('../models/Class');

router.get('/class-attendance', ensureAuthenticated, (req, res) => {
  res.render('class_attendance');
});

router.post('/add_list', ensureAuthenticated, (req, res) => {
  const { subject, section, students } = req.body;
  let err = false;
  let index;
  if (!subject || !section)
    return res.status(400).json({ err: `Fields are required` });
  if (subject.length < 3)
    return res
      .status(400)
      .json({ err: `Subject must contain 3 or more letters` });
  if (section.length < 3)
    return res
      .status(400)
      .json({ err: `Section must contain 3 or more letters` });
  students.forEach((item, i) => {
    if (item.firstName.length < 3 || item.lastName.length < 3) {
      console.log(i);
      console.log(item);
      index = i;
      err = true;
    }
  });
  if (err)
    return res.status(400).json({
      err: `user number ${index} must contain a name with 3 or more letters`,
    });

  Class.create({
    subject,
    section,
    students,
  })
    .then((data) => {
      const id = data.id;
      User.updateOne(
        { _id: req.user.id },
        { $push: { classID: id } },
        (err, result) => {
          if (err) return console.log(err);
          if (result) {
            res.status(200).json({ msg: 'Successfully save to database', id });
          }
        }
      );
    })
    .catch((e) => {
      console.log(e);
    });
});

module.exports = router;
