const express = require('express');
const router = express.Router();

router.get('/redirect-to-home/change-password', (req, res) => {
  req.flash('success_msg', 'Change password successfully');
  res.redirect('/login');
});

module.exports = router;
