const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { roomPage, quitRoom } = require('../controller/room/room');

const { nocache, generateRTCToken } = require('../controller/tokens/rtcToken'); // rtc token
const { generateRTMToken } = require('../controller/tokens/rtmToken'); // rtm token

router.get('/room', ensureAuthenticated, roomPage); // room page
router.get(
  '/rtc/:channel/:role/:tokentype',
  ensureAuthenticated,
  nocache,
  generateRTCToken
); // fetch rtc token
router.get('/rtm', ensureAuthenticated, nocache, generateRTMToken); // fetch rtm token
router.get('/quit', quitRoom); // quit the room

module.exports = router;
