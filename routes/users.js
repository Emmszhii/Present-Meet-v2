const express = require('express');
const router = express.Router();
const passportLocalMongoose = require('passport-local-mongoose');

const { ensureAuthenticated } = require('../config/auth');
const {
  userAuth,
  checkAttempts,
  checkLogin,
  successAuth,
} = require('../controller/login/login.js');
const {
  registerPage,
  registerPost,
} = require('../controller/register/register.js');

const { userSchema } = require('../models/User'); // User model
const { getProfile, postProfile } = require('../controller/profile/profile.js');
const { postChangePassword } = require('../controller/password/password.js');
const { userLogout } = require('../controller/logout/logout.js');

userSchema.plugin(passportLocalMongoose); // passport local mongoose plugin

router.get('/login', checkLogin); // Login Handle
router.post('/login', checkAttempts, userAuth, successAuth); // login success
router.get('/register', registerPage); // register page
router.post('/register', registerPost); // register
router.get('/profile', ensureAuthenticated, getProfile); // change info page
router.post('/profile', ensureAuthenticated, postProfile); // change info
router.post('/password', ensureAuthenticated, postChangePassword); // change password
router.get('/logout', userLogout); // Logout Handle

module.exports = router;
