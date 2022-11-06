const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
// tokens
const { nocache, generateRTCToken } = require('../tokens/rtcToken');
const { generateRTMToken } = require('../tokens/rtmToken');

// room Route
router.get('/room', ensureAuthenticated, (req, res) => {
  const { meetingId } = req.query;
  if (!meetingId) return res.redirect('*');
  return res.render('room');
});

router.get(
  '/rtc/:channel/:role/:tokentype',
  ensureAuthenticated,
  nocache,
  generateRTCToken
);

// // fetch rtm token
router.get('/rtm', ensureAuthenticated, nocache, generateRTMToken);

// quit the room
router.get('/quit', (req, res) => {
  res.redirect('/');
});

module.exports = router;
