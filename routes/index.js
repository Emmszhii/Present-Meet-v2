const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

const { Account, User } = require('../models/User'); // User model

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('home', { type: req.user.type });
}); // Welcome Page

router.get('/getInfo', ensureAuthenticated, async (req, res) => {
  const { _id, first_name, middle_name, last_name, type } = req.user;
  return res.status(200).json({
    _id,
    first_name,
    middle_name,
    last_name,
    type,
    AGORA_APP_ID: process.env.AGORA_APP_ID,
  });
}); // fetch user information

// router.get('/connection-secure', async (req, res) => {
//   const url = req.url;
//   const protocol = req.protocol;
//   const originalUrl = req.originalUrl;
//   const host = req.get('host');
//   const baseUrl = `${protocol}s://${host}${originalUrl}`;

//   res.render('404', {
//     title: `Connection is not secure`,
//     message: `Please use a secure https connection`,
//   });
// }); // connection not secure

module.exports = router;
