const { createJsonToken, verifyJsonToken } = require('../../config/jwt');
const { validateEmpty, comparePassword } = require('../helpers/functions');

const { ObjectId } = require('mongodb');
// mongoose model
const { Account, User } = require('../../models/User');
const { Teacher, Classroom, Attendance } = require('../../models/Class');

const classAttendance = (req, res) => {
  if (req.user.type !== 'teacher') return res.redirect('*');
  Teacher.findOneAndUpdate(
    { _id: req.user._id },
    { _id: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).then((err, result) => {});
  res.render('class_attendance');
};

const postAddNewClassList = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: 'Invalid Request' });

  const { subject, year_level, section, password } = req.body;

  if (!subject) return res.status(400).json({ err: `Subject is required` });
  if (!year_level)
    return res.status(400).json({ err: `Year level is required` });
  if (!section) return res.status(400).json({ err: `Section is required` });
  if (!password) return res.status(400).json({ err: `Password is required` });

  const classroom = new Classroom({
    subject,
    year_level,
    section,
  });

  try {
    const account = await Account.findOne({ _id: req.user._id }).exec();
    if (!account) return res.status(400).json({ err: `Invalid Request` });

    const pw = await comparePassword(password, account.password);

    if (pw) {
      const id = await classroom.save().then((data) => data._id);

      const teacher = await Teacher.findOne({ _id: req.user._id });

      teacher.classroom_id.push(id);

      const result = await teacher.save();
      console.log(result);
      if (result) {
        return res.status(200).json({
          data: `ok`,
          msg: `Class list successfully save to database`,
        });
      } else {
        return res.status(500).json({ err: `Something went wrong.` });
      }
    } else {
      return res.status(400).json({ err: `Invalid Password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(500), json({ err: `Something went wrong.` });
  }
};

const getClassrooms = (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

  Teacher.findOne({ _id: req.user._id })
    .populate({ path: 'classroom_id' })
    .then((data) => {
      const classroom = data.classroom_id;
      if (classroom.length < 1)
        return res.status(200).json({ msg: `Class is empty` });
      if (classroom.length > 0)
        return res.status(200).json({ data: classroom });
    })
    .catch((e) => {
      console.log(e);
      res.status(500).json({ err: `Something went wrong` });
    });
};

const getStudentsId = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

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
};

const postUpdateClass = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

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
  }
};

const deleteClassList = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

  const { id, password } = req.body;

  if (!id) return res.status(400).json({ err: 'ID is required' });
  if (!password) return res.status(400).json({ err: 'Password is required' });

  try {
    const _id = ObjectId(id);
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) return res.status(400).json({ err: `Invalid request` });

    const pw = await comparePassword(password, account.password);

    if (pw) {
      await Classroom.findOneAndRemove({ _id: _id });

      await Teacher.updateOne(
        { classroom_id: _id },
        { $pull: { classroom_id: _id } }
      );

      return res.status(200).json({ data: `ok`, msg: `Successfully deleted` });
    } else {
      return res.status(200).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
  }
};

const createClassToken = (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });
  const { id, expire } = req.params;

  const classroom = Classroom.findOne({ _id: id });

  if (!classroom) return res.status(400).json({ err: `Invalid ID` });

  const token = createJsonToken(id, expire);
  return res.status(200).json({ token });
};

const studentJoinClassPage = async (req, res) => {
  const token = req.query.token;

  const { id } = verifyJsonToken(token);
  if (!id) return res.redirect('*');

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
};

const resultJoiningClass = async (req, res) => {
  const token = req.query.token;

  if (!token) return res.status(400).json({ err: `Token is empty` });

  try {
    const { id } = verifyJsonToken(token);
    if (!id)
      return res
        .status(400)
        .json({ err: `Token expired, request a new link to your instructor` });
    const classroom = await Classroom.findOne({ _id: id });
    if (!classroom)
      return res.status(400).json({ err: `Class list does not exist` });
    classroom.students.push(req.user._id);
    classroom.save();
    return res.status(200).json({ msg: `You have joined the class list` });
  } catch (e) {
    console.log(e);
  }
};

const removeStudentFromClass = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

  const { id, password } = req.body;
  if (validateEmpty(id)) return res.status(400).json({ err: `Id is required` });
  if (validateEmpty(password))
    return res.status(400).json({ err: `Password is required` });

  try {
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) throw `Invalid request`;

    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      // await Classroom.updateOne({ students: id }, { $pull: { students: id } }); will be bug i think
      await Classroom.updateOne({ students: id }, { $pull: { students: id } });

      return res
        .status(200)
        .json({ msg: `Successfully deleted a student in the list` });
    } else {
      return res.status(400).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
  }
};

const changeActivityOfStudent = async (req, res) => {
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: `Request is invalid` });

  const { value, attendanceId, studentId } = req.body;
  let activity;

  if (!value) return res.status(400).json({ err: `Value invalid Request` });
  if (!attendanceId)
    return res.status(400).json({ err: `Attendance invalid Request` });
  if (!studentId)
    return res.status(400).json({ err: `Student invalid Request` });

  try {
    const attendance = await Attendance.findOne({ _id: attendanceId });

    if (!attendance)
      return res.status(400).json({ err: `Attendance invalid Request` });

    if (attendance.present.includes(studentId)) {
      // present
      await Attendance.updateOne(
        { _id: attendanceId },
        { $pull: { present: studentId } }
      );
      await Attendance.updateOne(
        { _id: attendanceId },
        { $push: { late: studentId } }
      );
      activity = `late`;
    } else if (attendance.late.includes(studentId)) {
      // late
      await Attendance.updateOne(
        { _id: attendanceId },
        { $pull: { late: studentId } }
      );
      activity = `absent`;
    } else {
      // absent
      await Attendance.updateOne(
        { _id: attendanceId },
        { $push: { present: studentId } }
      );
      activity = 'present';
    }

    const data = { value, attendanceId, studentId, activity };
    res.status(200).json({ data });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  classAttendance,
  postAddNewClassList,
  getClassrooms,
  getStudentsId,
  postUpdateClass,
  deleteClassList,
  createClassToken,
  studentJoinClassPage,
  resultJoiningClass,
  removeStudentFromClass,
  changeActivityOfStudent,
};
