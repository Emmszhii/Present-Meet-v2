const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

router.get('/class-attendance', (req, res) => {
  res.render('class_attendance');
});

module.exports = router;
