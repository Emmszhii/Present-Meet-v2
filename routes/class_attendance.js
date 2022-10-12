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

  console.log(req.user._id);

  Account.findOne({ _id: req.user._id }, (err, data) => {
    if (err) return res.status(400).json({ err: `Invalid request` });
    if (data) {
      bcrypt.compare(password, data.password, (err, result) => {
        if (err) return res.status(400).json({ err: `Invalid request` });
        if (!result) return res.status(400).json({ err: `Invalid password` });
        if (result) {
          classroom.save().then(async (classList) => {
            const teacher = await Teacher.findOne({ _id: req.user._id });

            teacher.classroom_id.push(classList._id);

            await teacher
              .save()
              .then((data) => {
                return data.populate({ path: `classroom_id` });
              })
              .then((data) => {
                res.status(200).json({
                  data: data.classroom_id,
                  msg: `Successfully save to database`,
                });
              })
              .catch((e) => {
                console.log(e);
                return res.status(400).json({ err: `Something went wrong` });
              });
          });
        }
      });
    }
  });
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

router.post('/update-class', ensureAuthenticated, (req, res) => {
  const { id, subject, year_level, section } = req.body;
  if (!id) return res.status(200).json({ err: `Invalid request` });
  if (validateEmpty(subject))
    return res.status(400).json({ err: `Subject is empty` });
  if (validateEmpty(year_level))
    return res.status(400).json({ err: `Year level is empty` });
  if (validateEmpty(section))
    return res.status(400).json({ err: `Section is empty` });

  // Classroom.find()
});

router.post('/delete-class-list', ensureAuthenticated, async (req, res) => {
  const { id, password } = req.body;

  if (!id) return res.status(400).json({ err: 'ID is required' });
  if (!password) return res.status(400).json({ err: 'Password is required' });

  // Account.findOne({ _id: req.user._id }, (err, account) => {
  //   if (err) return res.status(400).json({ err: `Something went wrong` });
  //   if (account) {
  //     bcrypt.compare(password, account.password, (err, result) => {
  //       if (err) return res.status(400).json({ err: 'Invalid request' });
  //       if (!result) return res.status(400).json({ err: 'Invalid password' });
  //       if (result)
  //         Teacher.findOneAndDelete({ classroom_id: id }, (err, data) => {
  //           if (err)
  //             return res.status(400).json({ err: `Something went wrong` });
  //           console.log(data);
  //           if (!data) return res.status(400).json({ msg: `No class found` });
  //           if (data) {
  //             console.log(data);
  //             return res
  //               .status(200)
  //               .json({ data, msg: `Successfully deleted to database` });
  //           }
  //         });
  //     });
  //   }
  // });

  try {
    const account = await Account.findOne({ _id: req.user._id }).exec();
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
        })
        .catch((e) => {
          return res.status(400).json({ err: e });
        });

      res.status(400).json({ err: `Something went wrong` });
    }
  } catch (e) {
    console.log(e);
  }
});

////////////////////////////////////////////////////////////////

// router.post('/add_list', ensureAuthenticated, async (req, res) => {
//   const { subject, year_level, section } = req.body;

//   if (!subject || !section || !year_level)
//     return res.status(400).json({ err: `All Fields are required` });
//   if (subject.length < 3)
//     return res
//       .status(400)
//       .json({ err: `Subject must contain 3 or more letters` });
//   if (section.length < 3)
//     return res
//       .status(400)
//       .json({ err: `Section must contain 3 or more letters` });

//   const class_room = new Classroom({
//     _id: req.user._id,
//     subject: subject.toUpperCase(),
//     year_level: year_level.toUpperCase(),
//     section: section.toUpperCase(),
//     students,
//   });

//   try {
//     class_room.save().then(() => {
//       res.status(200).json({ msg: `Successfully saved to database` });
//     });
//     const teacher = await Teacher.findOne({
//       _id: req.user._id,
//     });
//     teacher.classroom_id.push(class_room._id);
//     await teacher.save();
//   } catch (e) {
//     return res.status(400).json({ e });
//   }
// });

// router.get('/get_students/:id', ensureAuthenticated, (req, res) => {
//   const id = req.params.id;
//   if (!id) return res.status(400).json({ INVALID_REQUEST: 'Request is empty' });

//   try {
//     Classroom.findOne({ _id: id }).then((data) => {
//       if (!data) return res.status(400).json({ err: 'Invalid request' });
//       const { _id, subject, year_level, section, students } = data;
//       res.status(200).json({ _id, subject, year_level, section, students });
//     });
//   } catch (e) {
//     res.status(400).json({ e });
//   }
// });

// router.post('/add-student', ensureAuthenticated, (req, res) => {
//   const { first_name, middle_name, last_name } = req.body;

//   if (!first_name || first_name.trim() === '')
//     return res.status(400).json({ err: `First Name is empty` });
//   if (!last_name || last_name.trim() === '')
//     return res.status(400).json({ err: `Last Name is empty` });

//   const capitalize_firstName = capitalize(first_name);
//   const capitalize_middleName = capitalize(middle_name);
//   const capitalize_lastName = capitalize(last_name);

//   students.push({
//     first_name: capitalize_firstName,
//     middle_name: capitalize_middleName,
//     last_name: capitalize_lastName,
//   });
//   // console.log(students);
//   res.status(200).json({ students });
// });

// router.post('/update-student', ensureAuthenticated, (req, res) => {
//   const { first_name, middle_name, last_name, value } = req.body;
//   const n = parseInt(value);
//   const valid = typeof n === 'number';
//   if (validateNameEmpty(first_name))
//     return res.status(400).json({ err: 'Invalid first name' });
//   // if (validateNameEmpty(middle_name))
//   //   return res.status(400).json({ err: 'Invalid middle name' });
//   if (validateNameEmpty(last_name))
//     return res.status(400).json({ err: 'Invalid last name' });
//   // console.log(!n, !value, !valid);
//   if (!value || !valid) return res.status(400).json({ err: 'Invalid request' });

//   // Classroom.findById({});

//   // for (const [index, student] of students.entries()) {
//   //   if (n === index) {
//   //     student.first_name = capitalize(first_name);
//   //     student.middle_name = capitalize(middle_name);
//   //     student.last_name = capitalize(last_name);
//   //     return res.status(200).json({ students, msg: `Updated successfully` });
//   //   }
//   // }

//   res.status(400).json({ err: `Something Went Wrong!` });
// });

module.exports = router;
