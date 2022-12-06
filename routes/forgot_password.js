const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { createJsonToken, verifyJsonToken } = require('../config/jwt');
const { forgotPasswordMail } = require('../config/sendGrid');
const { isEmail } = require('validator');
const { generateHashPassword } = require('./helpers/functions');

const { Account } = require('../models/User');

router.post('/forgot-password', async (req, res) => {
  const { emailValue: email } = req.body;
  if (!email || email.trim().length === 0)
    return res.status(400).json({ err: `Invalid email` });
  if (!isEmail(email))
    return res.status(400).json({ err: 'Email is not valid' });
  try {
    const account = await Account.findOne({ email: email });
    if (!account)
      return res.status(400).json({ err: `This email is not registered` });

    const number = Math.floor(100000 + Math.random() * 900000); // 6 digit number
    const otp = createJsonToken({ email, number }, '2m');
    const { err } = forgotPasswordMail(email, number);
    if (err) return res.status(400).json({ err: `Something went wrong` });
    const data = { token: otp };
    return res.status(200).json({ data });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: `Something went wrong` });
  }
});

router.get('/forgot-password/:code/:token', async (req, res) => {
  const { code, token } = req.params;
  const userInputCode = +code;
  if (isNaN(userInputCode))
    return res.status(400).json({ err: `Invalid Code Input` });
  const verifiedToken = verifyJsonToken(token);
  if (!verifiedToken || verifiedToken === 'invalid token')
    return res.status(400).json({ err: `Invalid Request` });

  const { number, email } = verifiedToken.id;
  const data = { email };
  userInputCode === number ? (data.success = true) : (data.failed = true);
  return res.status(200).json({ data });
});

router.post('/forgot-password/change-password', async (req, res) => {
  const { pw1, pw2, token } = req.body;
  if (!pw1 || pw1.trim().length === 0)
    return res.status(400).json({ err: `Password should not be empty` });
  if (pw1.length < 6)
    return res
      .status(400)
      .json({ err: `Password should be at least 6 or more characters` });
  if (pw1 !== pw2)
    return res.status(400).json({ err: `Password should be the same` });
  if (!token) return res.status(400).json({ err: `Invalid request` });

  try {
    const data = { success: null, failed: null };
    const verifiedToken = verifyJsonToken(token);
    if (!verifiedToken || verifiedToken === 'invalid token')
      return res.status(400).json({ err: `Invalid Request` });

    const { email } = verifiedToken.id;

    const account = await Account.findOne({ email: email });
    if (!account) return res.status(400).json({ err: `Account Invalid` });

    const hash = await generateHashPassword(pw1);
    account.password = hash;
    const success = account.save();
    success ? (data.success = true) : (data.failed = false);
    return res.status(200).json({ data });
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: `Something went wrong` });
  }
});

module.exports = router;
