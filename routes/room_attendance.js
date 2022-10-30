const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken, verifyJsonToken } = require('../config/jwt');
const {
  students,
  restrictMultipleAttendance,
} = require('./helpers/presentAttendance');

const {
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
} = require('./helpers/functions');
const { Account, User } = require('../models/User');
const { Teacher, Classroom, Attendance } = require('../models/Class');

router.post(
  '/create-attendance/:restrict',
  ensureAuthenticated,
  async (req, res) => {
    const restrict = req.params.restrict;
    const { meetingId, id: classId } = req.body;

    if (restrict !== 'on' && restrict !== 'off')
      return res.status(400).json({ err: `Invalid restriction request` });
    if (!meetingId)
      return res.status(400).json({ err: `Invalid channel request` });

    try {
      if (restrict === 'on') {
        const teacher = await Teacher.findOne({ _id: req.user._id });
        if (!teacher) return res.status(400).json({ err: `Invalid request` });

        const classroom = await Classroom.findOne({ _id: classId });
        if (!classroom) return res.status(400).json({ err: `Invalid request` });
        if (classroom.students.length === 0)
          return res.status(400).json({ err: `No student(s) registered` });

        const { minutes, seconds, err } = await restrictMultipleAttendance(
          classId
        );

        if (minutes) return res.status(400).json({ err });
        if (seconds) return res.status(400).json({ err });

        const attendance = new Attendance();
        classroom.attendance_id.push(attendance._id);
        await attendance.save();
        await classroom.save();

        return res.status(200).json({
          data: {
            attendance_id: attendance._id,
          },
        });
      } else {
        res.status(200).json({ msg: `Not yet implemented` });
      }
    } catch (e) {
      console.log(e);
    }
  }
);

router.post(
  '/add-student-attendance',
  ensureAuthenticated,
  async (req, res) => {
    const { attendance_id, classroom_id, student_id } = req.body;

    try {
      const classroom = await Classroom.findOne({ _id: classroom_id });
      if (!classroom)
        return res.status(400).json({ err: `No classroom found` });

      const student = await Classroom.findOne({ _id: classroom_id }).populate({
        path: 'students',
        match: { _id: student_id },
      });
      if (!student)
        return res
          .status(400)
          .json({ err: `Student not found in the database` });

      const attendance = await Attendance.findOne({ _id: attendance_id });
      if (!attendance)
        return res
          .status(400)
          .json({ err: `No attendance file created in the database` });

      attendance.present.push(student_id);
      await attendance.save();
      console.log(attendance);

      const data = await students(attendance_id);
      const queryStudent = student.students[0];
      const firstName = queryStudent.first_name;
      const lastName = queryStudent.last_name;
      return res.status(200).json({
        data,
        msg: `Student ${lastName}, ${firstName} has been saved to the attendance`,
      });
    } catch (e) {
      console.log(e);
    }
  }
);

router.post('/student-attendance', ensureAuthenticated, async (req, res) => {
  const { student_id, classroom_id, attendance_id, user } = req.body;
  if (user !== 'late' && user !== 'present' && user !== 'absent')
    return res.status(400).json({ err: `Invalid user request` });

  const student = await Classroom.findOne({ _id: classroom_id }).populate({
    path: 'students',
    match: { _id: student_id },
  });

  const queryStudent = student.students[0]._id;
  if (!queryStudent) return res.status(400).json({ err: `Invalid student` });

  const attendance = await Attendance.findOne({ _id: attendance_id })
    .populate({ path: 'present', match: { _id: student_id } })
    .populate({ path: 'late', match: { _id: student_id } });
  if (!attendance) return res.status(400).json({ err: `Invalid classroom ID` });

  const isStudentPresent = attendance.present.includes(student_id);
  const isStudentLate = attendance.late.includes(student_id);

  if (user === 'present') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { late: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $push: { present: student_id } }
    );
  }
  if (user === 'late') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { present: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $push: { late: student_id } }
    );
  }
  if (user === 'absent') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { present: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { late: student_id } }
    );
  }
  const firstName = student.students[0].first_name;
  const lastName = student.students[0].last_name;

  res.status(200).json({
    msg: `User ${lastName}, ${firstName} is ${user}`,
    data: 'ok',
  });
});

router.post('/check-present', ensureAuthenticated, async (req, res) => {
  const { attendance_id } = req.body;

  console.log(attendance_id);
  const { err, attendance } = await students(attendance_id);
  console.log(err, attendance);
  res.status(200).json({ err, attendance });
});

module.exports = router;
