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
  students.forEach((_, i, item) => {
    console.log(item);
    if (
      item[i].firstName.trim().length < 3 ||
      item[i].lastName.trim().length < 3
    ) {
      index = i;
      err = true;
    }

    const to_lower_fname = item[i].firstName.toLowerCase();
    const to_lower_lname = item[i].lastName.toLowerCase();
    newStudentsArr.push({
      firstName: capitalize(to_lower_fname),
      lastName: capitalize(to_lower_lname),
    });
  });
  console.log(newStudentsArr);
  if (err)
    return res.status(400).json({
      err: `User number ${index} must contain a name with 3 or more letters`,
    });

  const class_room = new Classroom({
    teacher_id: req.user.account_id,
    subject,
    section,
    students: newStudentsArr,
  });

  class_room
    .save()
    .then(() => {
      res.status(200).json({ msg: `Successfully saved to database` });
    })
    .catch((e) => res.status(400).json({ e }));
  // .then((data) => {
  //   const id = data.id;
  //   User.updateOne(
  //     { _id: req.user.account_id },
  //     { $push: { classID: id } },
  //     (err, result) => {
  //       if (err) return console.log(err);
  //       if (result) {
  //         res.status(200).json({ msg: 'Successfully save to database', id });
  //       }
  //     }
  //   );
  // })
  // .catch((e) => {
  //   console.log(e);
  // });
});

module.exports = router;
