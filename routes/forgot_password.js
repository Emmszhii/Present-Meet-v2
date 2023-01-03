const express = require('express');
const router = express.Router();

const {
  getPage,
  postForgotPassword,
  getForgotPasswordCodeToken,
  changePassword,
} = require('../controller/forgot_password/forgot_password.js');

router.get('/forgot-password', getPage); // page
router.post('/forgot-password', postForgotPassword); // get email
router.get('/forgot-password/:code/:token', getForgotPasswordCodeToken); // generate code and verify
router.post('/forgot-password/change-password', changePassword); // change password

module.exports = router;
