const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/redirect-to-home/change-password', (req, res) => {
  req.flash('success_msg', 'Change password successfully');
  res.redirect('/login');
});

module.exports = router;
