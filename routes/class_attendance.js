const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { capitalize } = require('./helpers/functions');

// mongoose model
const { Teacher, Classroom, Attendance } = require('../models/Class');

router.get('/class-attendance', ensureAuthenticated, (req, res) => {
  Teacher.findOneAndUpdate(
    { teacher_id: req.user.account_id },
    { teacher_id: req.user.account_id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).then((err, result) => {
    // if (err) console.log(err);
    // if (result) console.log(result);
  });

  res.render('class_attendance');
});

router.post('/add_list', ensureAuthenticated, async (req, res) => {
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

  try {
    class_room.save().then(() => {
      res.status(200).json({ msg: `Successfully saved to database` });
    });
    const teacher = await Teacher.findOne({
      teacher_id: req.user.account_id,
    });
    teacher.classroom_id.push(class_room._id);
    await teacher.save();
  } catch (e) {
    return res.status(400).json({ e });
  }
});

router.get(`/get_classroom`, ensureAuthenticated, (req, res) => {
  Teacher.findOne({ teacher_id: req.user.account_id })
    .populate({ path: 'classroom_id' })
    .then((data) => {
      const info = data.classroom_id;
      info.map((item) => console.log(item.students));
      if (info.length < 1)
        return res.status(200).json({ msg: `Class is empty` });
      if (info.length > 0) return res.status(200).json({ data: info });
    });
});

router.get('/get_students/:id', ensureAuthenticated, (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ INVALID_REQUEST: 'Request is empty' });

  try {
    Classroom.findOne({ _id: id }).then((data) => {
      if (!data) return res.status(400).json({ err: 'Invalid request' });
      const { _id, subject, section, students } = data;
      res.status(200).json({ _id, subject, section, students });
    });
  } catch (e) {
    res.status(400).json({ e });
  }
});

// TEST

router.get(`/test`, async (req, res) => {
  const class_room = new Classroom({
    subject: `jajkahsdja`,
    section: `kajsdkahsjdh`,
    students: [
      { first_name: 'hel', lastName: 'heas' },
      { first_name: 'hello', lastName: 'hea' },
    ],
  });

  await class_room.save();
  res.json({ class_room });
});

router.get(`/test1`, async (req, res) => {
  const attendance = new Attendance({
    date: Date.now(),
  });
  attendance.save();

  const class_room = await Classroom.findOne({
    subject: `jajkahsdja`,
  });
  class_room.attendance_id.push(attendance._id);
  class_room.save();
  console.log(class_room.populated('attendance_id'));
  res.json({ attendance, class_room });
});

module.exports = router;
