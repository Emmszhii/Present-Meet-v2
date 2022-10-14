const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const {
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
} = require('./helpers/functions');

// mongoose model
const { Account } = require('../models/User');
const { Teacher, Classroom, Attendance } = require('../models/Class');

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
    console.log(account);
    if (!account) throw `Account not found!`;

    const pw = await comparePassword(password, account.password);

    if (pw) {
      const id = await classroom.save().then((data) => data._id);
      console.log(id);

      const teacher = await Teacher.findOne({ _id: req.user._id });

      teacher.classroom_id.push(id);

      await teacher.save().then(() => {
        return res.status(200).json({
          data: 'ok',
          msg: `CLass list successfully save to database`,
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
  Teacher.findOne({ _id: req.user._id })
    .populate({ path: 'classroom_id' })
    .then((data) => {
      const classroom = data.classroom_id;
      if (classroom.length < 1)
        return res.status(200).json({ msg: `Class is empty` });
      if (classroom.length > 0)
        return res.status(200).json({ data: classroom });
    });
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
    // console.log(account);

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

      Teacher.findOne({ _id: req.user._id })
        .populate('classroom_id')
        .exec((err, data) => {
          if (err) return res.status(400).json({ err: `Something went wrong` });
          console.log(data);
          return res.status(200).json({ data: data.classroom_id });
        });
    } else {
      res.status(200).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
  }
});

router.get('/class-attendance/:id', (req, res) => {
  res.status(200).json({ msg: 'hello' });
});

module.exports = router;
