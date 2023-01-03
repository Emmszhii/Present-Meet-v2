const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const {
  createAttendance,
  addStudentAttendance,
  toggleStudentAttendance,
  checkPresent,
} = require('../controller/room_attendance/room_attendance.js');

router.post(
  '/create-attendance/:restrict',
  ensureAuthenticated,
  createAttendance
); // create new attendance
router.post(
  '/add-student-attendance',
  ensureAuthenticated,
  addStudentAttendance
); // add student attendance to db
router.post(
  '/student-attendance',
  ensureAuthenticated,
  toggleStudentAttendance
); // toggle student attendance
router.post('/check-present', ensureAuthenticated, checkPresent); // check if student is present

module.exports = router;
