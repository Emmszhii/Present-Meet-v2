const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken, verifyJsonToken } = require('../config/jwt');
const { validateEmpty, comparePassword } = require('./helpers/functions');

const { ObjectId } = require('mongodb');
// mongoose model
const { Account, User } = require('../models/User');
const { Teacher, Classroom, Attendance } = require('../models/Class');
const {
  classAttendance,
  postAddClassList,
  getClassrooms,
  getStudentsId,
  postUpdateClass,
  deleteClassList,
  createClassToken,
  studentJoinClassPage,
  resultJoiningClass,
  removeStudentFromClass,
  changeActivityOfStudent,
} = require('../controller/class_attendance/class_attendance');

router.get('/class-attendance', ensureAuthenticated, classAttendance);
router.post('/add-class-list', ensureAuthenticated, postAddClassList);
router.get(`/get_classroom`, ensureAuthenticated, getClassrooms);
router.get('/get_students/:id', ensureAuthenticated, getStudentsId);
router.post('/update-class', ensureAuthenticated, postUpdateClass);
router.post('/delete-class-list', ensureAuthenticated, deleteClassList);
router.get(
  '/generate-class-token/:id/:expire',
  ensureAuthenticated,
  createClassToken
); // teacher token invite
router.get(
  '/class-attendance/join-class',
  ensureAuthenticated,
  studentJoinClassPage
); // student joining
router.get('/join-class', ensureAuthenticated, resultJoiningClass); // result student joining
router.post('/delete-student', ensureAuthenticated, removeStudentFromClass); // remove student
router.post(
  '/change-activity-student',
  ensureAuthenticated,
  changeActivityOfStudent
);

module.exports = router;
