const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const { Account, User } = require('../models/User');

// Welcome Page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home', { type: req.user.type });
});

// // fetch user information
router.get('/getInfo', ensureAuthenticated, async (req, res) => {
  console.log(req.user);
  const { _id, first_name, last_name, type } = req.user;
  try {
    res.status(200).json({
      user: {
        _id,
        first_name,
        last_name,
        type,
      },
      AGORA_APP_ID: process.env.AGORA_APP_ID,
    });
  } catch (e) {
    res.status(400).json({ err: 'Something gone wrong!' });
  }
});

module.exports = router;
