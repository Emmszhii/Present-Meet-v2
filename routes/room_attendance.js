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
const { Account, User } = require('../models/User');
const { Teacher } = require('../models/Class');

router.get('/create-attendance', ensureAuthenticated, async (req, res) => {
  const teacher = Teacher.findOne({ _id: req.user._id });

  console.log(teacher);

  res.status(200).json({ data: `created` });
});

module.exports = router;
