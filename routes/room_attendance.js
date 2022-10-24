const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken, verifyJsonToken } = require('../config/jwt');

const {
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
} = require('./helpers/functions');

router.get;

module.exports = router;
