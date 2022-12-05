const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken } = require('../config/jwt');
const { forgotPasswordMail } = require('../config/nodemailer');

router.post('/forgot-password', async (req, res) => {
  const { emailValue: email } = req.body;
  if (!email || email.trim().length === 0)
    return res.status(400).json({ err: `Invalid email` });
  const number = Math.floor(100000 + Math.random() * 900000); // 6 digit number
  const otp = createJsonToken({ email, number }, '10m');
  const { err } = forgotPasswordMail(email, number);
  if (err) return res.status(400).json({ err: `Something went wrong` });

  res.status(200).json({ otp });
});

module.exports = router;
