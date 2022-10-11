const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const {
  capitalize,
  validateName,
  validateNameEmpty,
} = require('./helpers/functions');

// mongoose model
const { Teacher, Classroom, Attendance } = require('../models/Class');

const students = [];

router.get('/class-attendance', ensureAuthenticated, (req, res) => {
  Teacher.findOneAndUpdate(
    { teacher_id: req.user.account_id },
    { teacher_id: req.user.account_id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).then((err, result) => {
    if (err) console.log(err);
    if (result) console.log(result);
  });

  res.render('class_attendance');
});

router.post('/add_list', ensureAuthenticated, async (req, res) => {
  const { subject, year_level, section } = req.body;

  if (!subject || !section || !year_level)
    return res.status(400).json({ err: `All Fields are required` });
  if (subject.length < 3)
    return res
      .status(400)
      .json({ err: `Subject must contain 3 or more letters` });
  if (section.length < 3)
    return res
      .status(400)
      .json({ err: `Section must contain 3 or more letters` });

  const class_room = new Classroom({
    teacher_id: req.user.account_id,
    subject: subject.toUpperCase(),
    year_level: year_level.toUpperCase(),
    section: section.toUpperCase(),
    students,
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
      // info.map((item) => console.log(item.students));
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
      const { _id, subject, year_level, section, students } = data;
      res.status(200).json({ _id, subject, year_level, section, students });
    });
  } catch (e) {
    res.status(400).json({ e });
  }
});

router.post('/add-student', ensureAuthenticated, (req, res) => {
  const { first_name, middle_name, last_name } = req.body;

  if (!first_name || first_name.trim() === '')
    return res.status(400).json({ err: `First Name is empty` });
  if (!last_name || last_name.trim() === '')
    return res.status(400).json({ err: `Last Name is empty` });

  const capitalize_firstName = capitalize(first_name);
  const capitalize_middleName = capitalize(middle_name);
  const capitalize_lastName = capitalize(last_name);

  students.push({
    first_name: capitalize_firstName,
    middle_name: capitalize_middleName,
    last_name: capitalize_lastName,
  });
  // console.log(students);
  res.status(200).json({ students });
});

router.post('/update-student', ensureAuthenticated, (req, res) => {
  const { first_name, middle_name, last_name, value } = req.body;
  const n = parseInt(value);
  const valid = typeof n === 'number';
  if (validateNameEmpty(first_name))
    return res.status(400).json({ err: 'Invalid first name' });
  // if (validateNameEmpty(middle_name))
  //   return res.status(400).json({ err: 'Invalid middle name' });
  if (validateNameEmpty(last_name))
    return res.status(400).json({ err: 'Invalid last name' });
  // console.log(!n, !value, !valid);
  if (!value || !valid) return res.status(400).json({ err: 'Invalid request' });

  for (const [index, student] of students.entries()) {
    if (n === index) {
      student.first_name = capitalize(first_name);
      student.middle_name = capitalize(middle_name);
      student.last_name = capitalize(last_name);
      return res.status(200).json({ students, msg: `Updated successfully` });
    }
  }
  res.status(400).json({ err: `Something Went Wrong!` });
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
