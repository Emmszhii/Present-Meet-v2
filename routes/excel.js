const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const {
  getStudentsInfo,
  allAttendanceInClassroom,
} = require('../controller/excel/excel');

router.post('/get-all-users-info', ensureAuthenticated, getStudentsInfo); // all students info
router.get(
  '/all-attendance-classroom/:id',
  ensureAuthenticated,
  allAttendanceInClassroom
); // all attendance in a class

module.exports = router;
