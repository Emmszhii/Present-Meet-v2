const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const { Account, User } = require('../models/User');

router.post('/get-all-users-info', ensureAuthenticated, async (req, res) => {
  const arr = req.body;
  console.log(arr);
  if (!Array.isArray(arr))
    return res.status(400).json({ err: `Invalid Request` });
  if (!arr) return res.status(400).json({ err: `Invalid Request` });

  const users = await User.find({ _id: { $in: arr } });
  if (!users) return res.status(400).json({ err: `No users found` });

  if (arr) return res.status(400).json({ data: users });
});

module.exports = router;
