const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { capitalize } = require('./helpers/functions');

// mongoose model
const { Classroom } = require('../models/Class');

router.get('/class-attendance', ensureAuthenticated, (req, res) => {
  res.render('class_attendance');
});

router.post('/add_list', ensureAuthenticated, (req, res) => {
  const { subject, section, students } = req.body;
  const newStudentsArr = [];
  const err = [];
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
  students.forEach((_, i, item) => {
    if (
      item[i].firstName.trim().length < 3 ||
      item[i].lastName.trim().length < 3
    )
      err.push(
        `User number ${i + 1} must contain a name with 3 or more letters.`
      );
    if (item[i].firstName.trim() === '' && item[i].firstName.trim() === '')
      err.push(`User number ${i + 1} is empty!`);
    const valid_last_name = item[i].lastName.split(' ');
    if (valid_last_name.length > 1) err.push(`User number ${i + 1} is invalid`);

    const to_lower_fname = item[i].firstName.toLowerCase();
    const to_lower_lname = item[i].lastName.toLowerCase();
    newStudentsArr.push({
      firstName: capitalize(to_lower_fname),
      lastName: capitalize(to_lower_lname),
    });
  });
  console.log(newStudentsArr);
  if (err.length > 0)
    return res.status(400).json({
      err,
    });

  const class_room = new Classroom({
    teacher_id: req.user.account_id,
    subject: subject.toUpperCase(),
    section: section.toUpperCase(),
    students: newStudentsArr,
  });

  class_room
    .save()
    .then(() => {
      res.status(200).json({ msg: `Successfully saved to database` });
    })
    .catch((e) => res.status(400).json({ e }));
});

router.get(`/get_classroom`, ensureAuthenticated, (req, res) => [
  Classroom.find({ teacher_id: req.user.account_id }, (err, data) => {
    if (err) return res.status(400).json({ err: `No data found` });
    if (data) {
      console.log(data);
      res.status(200).json({ data });
    }
  }),
]);

module.exports = router;
