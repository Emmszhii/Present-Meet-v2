const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const {
  faceRecognitionPage,
  getThreshold,
  getDescriptor,
  changeDescriptor,
  getStudentDescriptor,
  getTinyFaceOptions,
} = require('../controller/face_recognition/face_recognition.js');

router.get('/face-recognition', ensureAuthenticated, faceRecognitionPage); // page
router.get('/face-recognition/threshold', ensureAuthenticated, getThreshold); // threshold
router.get('/get-descriptor', ensureAuthenticated, getDescriptor); // get descriptor
router.post('/descriptor', ensureAuthenticated, changeDescriptor); // set descriptor
router.get(
  '/student-descriptor/:id',
  ensureAuthenticated,
  getStudentDescriptor
); // student descriptor
router.get(
  '/face-recognition/tiny-face-options',
  ensureAuthenticated,
  getTinyFaceOptions
);

module.exports = router;
