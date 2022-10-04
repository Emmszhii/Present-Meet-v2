const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
// tokens
const { nocache, generateRTCToken } = require('../tokens/rtcToken');
const { generateRTMToken } = require('../tokens/rtmToken');
const { token } = require('../tokens/token');

// User model
const User = require('../models/User');

// room Route
router.get('/room', ensureAuthenticated, (req, res) => {
  res.render('room');
});

// // fetch rtc token
router.get(
  '/rtc/:channel/:role/:tokentype/:id',
  ensureAuthenticated,
  nocache,
  generateRTCToken
);

router.get('/tokens/:channel', nocache, (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const channel = req.params.channel;
  console.log(channel);
  const id = `klahsdkljhajksk12h31kl`;
  token(channel, id);
  console.log(data);
  // return res.json({ data });
});

// // fetch rtm token
router.get('/rtm/:uid', ensureAuthenticated, nocache, generateRTMToken);

// quit the room
router.get('/quit', (req, res) => {
  res.redirect('/');
});

module.exports = router;
