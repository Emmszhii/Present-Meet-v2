const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const {
  faceRecognitionPage,
  threshold,
  getDescriptor,
  changeDescriptor,
  getStudentDescriptor,
} = require('../controller/face_recognition/face_recognition');

router.get('/face-recognition', ensureAuthenticated, faceRecognitionPage); // page
router.get('/get-face-recognition-threshold', ensureAuthenticated, threshold); // threshold
router.get('/get-descriptor', ensureAuthenticated, getDescriptor); // get descriptor
router.post('/descriptor', ensureAuthenticated, changeDescriptor); // set descriptor
router.get(
  '/student-descriptor/:id',
  ensureAuthenticated,
  getStudentDescriptor
); // student descriptor

module.exports = router;
