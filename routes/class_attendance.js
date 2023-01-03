const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

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
} = require('../controller/class_attendance/class_attendance.js');

router.get('/class-attendance', ensureAuthenticated, classAttendance);
router.get(`/get_classroom`, ensureAuthenticated, getClassrooms);
router.get('/get_students/:id', ensureAuthenticated, getStudentsId);
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
router.post('/add-class-list', ensureAuthenticated, postAddClassList);
router.post('/update-class', ensureAuthenticated, postUpdateClass);
router.post('/delete-class-list', ensureAuthenticated, deleteClassList);
router.get('/join-class', ensureAuthenticated, resultJoiningClass); // result student joining
router.post('/delete-student', ensureAuthenticated, removeStudentFromClass); // remove student
router.post(
  '/change-activity-student',
  ensureAuthenticated,
  changeActivityOfStudent
);

module.exports = router;
