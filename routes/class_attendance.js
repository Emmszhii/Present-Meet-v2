const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken, verifyJsonToken } = require('../config/jwt');
const {
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
} = require('./helpers/functions');

// mongoose model
const { Account, User } = require('../models/User');
const { Teacher, Classroom, Attendance } = require('../models/Class');
const { text } = require('body-parser');

router.get('/class-attendance', ensureAuthenticated, (req, res) => {
  Teacher.findOneAndUpdate(
    { _id: req.user._id },
    { _id: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).then((err, result) => {});

  res.render('class_attendance');
});

router.post('/add-class-list', ensureAuthenticated, async (req, res) => {
  const { subject, year_level, section, password } = req.body;

  if (!subject) res.status(400).json({ err: `Subject is required` });
  if (!year_level) res.status(400).json({ err: `Year level is required` });
  if (!section) res.status(400).json({ err: `Section is required` });
  if (!password) res.status(400).json({ err: `Password is required` });

  const classroom = new Classroom({
    subject,
    year_level,
    section,
  });

  try {
    const account = await Account.findOne({ _id: req.user._id }).exec();
    if (!account) throw `Account not found!`;

    const pw = await comparePassword(password, account.password);

    if (pw) {
      const id = await classroom.save().then((data) => data._id);

      const teacher = await Teacher.findOne({ _id: req.user._id });

      teacher.classroom_id.push(id);

      await teacher.save().then(() => {
        return res.status(200).json({
          data: `ok`,
          msg: `Class list successfully save to database`,
        });
      });
    } else {
      return res.status(400).json({ err: `Invalid Password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: e });
  }
});

router.get(`/get_classroom`, ensureAuthenticated, (req, res) => {
  if (req.user.type === 'teacher') {
    Teacher.findOne({ _id: req.user._id })
      .populate({ path: 'classroom_id' })
      .then((data) => {
        const classroom = data.classroom_id;
        if (classroom.length < 1)
          return res.status(200).json({ msg: `Class is empty` });
        if (classroom.length > 0)
          return res.status(200).json({ data: classroom });
      });
  } else {
    return res.status(400).json({ err: `Request is invalid` });
  }
});

router.get('/get_students/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const classroom = await Classroom.findOne({ _id: id }).populate({
      path: 'students',
      options: { sort: { last_name: 1, first_name: 1 } },
    });

    if (!classroom) return res.status(400).json({ err: `Invalid request` });

    if (classroom.students.length < 1)
      return res.status(200).json({ msg: `Student is empty` });
    if (classroom.students.length > 0)
      return res.status(200).json({ data: classroom.students });
  } catch (e) {
    console.log(e);
  }
});

router.post('/update-class', ensureAuthenticated, async (req, res) => {
  const { id, subject, year_level, section, password } = req.body;
  if (!id) return res.status(200).json({ err: `Invalid request` });
  if (validateEmpty(subject))
    return res.status(400).json({ err: `Subject is empty` });
  if (validateEmpty(year_level))
    return res.status(400).json({ err: `Year level is empty` });
  if (validateEmpty(section))
    return res.status(400).json({ err: `Section is empty` });
  if (validateEmpty(password))
    return res.status(400).json({ err: `Password is required` });

  try {
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) return res.status(400).json({ err: `Invalid request` });

    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      await Classroom.updateOne({ _id: id }, { subject, year_level, section });
      return res.status(200).json({ data: `ok`, msg: `Successfully update` });
    } else {
      return res.status(400).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: e });
  }
});

router.post('/delete-class-list', ensureAuthenticated, async (req, res) => {
  const { id, password } = req.body;

  if (!id) return res.status(400).json({ err: 'ID is required' });
  if (!password) return res.status(400).json({ err: 'Password is required' });

  try {
    const account = await Account.findOne({ _id: req.user._id }).exec();
    if (!account) throw `User not found`;
    const pw = await comparePassword(password, account.password);

    if (pw) {
      await Classroom.findOneAndRemove({ _id: id }, { new: false });

      await Teacher.updateOne(
        { classroom_id: id },
        { $pull: { classroom_id: id } }
      );

      return res.status(200).json({ data: `Successfully deleted` });
    } else {
      res.status(200).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
  }
});

router.get(
  '/generate-class-token/:id/:expire',
  ensureAuthenticated,
  (req, res) => {
    const { id, expire } = req.params;
    const token = createJsonToken(id, expire);
    return res.status(200).json({ token });
  }
);

router.get('/class-attendance/join', ensureAuthenticated, async (req, res) => {
  const id = req.query.id;
  const token = req.query.token;

  const classroom = await Classroom.findOne({ _id: id });
  const teacher = await Teacher.findOne({ classroom_id: id });
  const teacher_user = await User.findOne({ _id: teacher._id });
  const student_user = await User.findOne({ _id: req.user._id });

  const instructor = `${teacher_user.last_name}, ${teacher_user.first_name}`;
  const user = `${student_user.last_name}, ${student_user.first_name}`;
  const subject = classroom.subject;
  const section = classroom.section;
  const year_level = classroom.year_level;
  const type = req.user.type;

  let isExist = false;
  let text = ``;

  // check if user is a teacher
  if (req.user.type === 'teacher') {
    text = 'This is for student account only';
  }

  // query if user is already in the class list
  const exist = await Classroom.findOne({
    _id: id,
    students: { $in: req.user._id },
  });
  if (exist) {
    isExist = true;
    text = `You are already in this class list`;
  }

  return res.render('join_class', {
    isExist,
    text,
    instructor,
    id,
    user,
    subject,
    section,
    year_level,
    type,
  });
});

router.get('/join/:id/:token', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  const token = req.params.token;

  if (!id) return res.status(400).json({ err: `Link ID is empty` });
  if (!token) return res.status(400).json({ err: `Token is empty` });

  try {
    const classroom = await Classroom.findOne({ _id: id });
    if (!classroom)
      return res.status(400).json({ err: `Class list does not exist` });

    const verifyToken = verifyJsonToken(token);
    if (verifyToken.data === id) {
      classroom.students.push(req.user._id);
      classroom.save();
      return res.status(200).json({ msg: `You have joined the class list` });
    } else {
      return res
        .status(400)
        .json({ err: `Token expired, request a new link to your instructor` });
    }
  } catch (e) {
    console.log(e);
  }
  return res.status(400).json({ err: e });
});

// STUDENTS
router.post('/delete-student', ensureAuthenticated, async (req, res) => {
  const { id, password } = req.body;
  if (validateEmpty(id)) return res.status(400).json({ err: `Id is required` });
  if (validateEmpty(password))
    return res.status(400).json({ err: `Password is required` });

  try {
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) throw `Invalid request`;

    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      await Classroom.updateOne({ students: id }, { $pull: { students: id } });

      return res
        .status(200)
        .json({ msg: `Successfully deleted a student in the list` });
    } else {
      return res.status(400).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: e });
  }
});

module.exports = router;
