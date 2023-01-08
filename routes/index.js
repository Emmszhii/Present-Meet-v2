const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { getBasicInfo, homePage } = require('../controller/home/home.js');

router.get('/', ensureAuthenticated, homePage); // Welcome Page
router.get('/getInfo', ensureAuthenticated, getBasicInfo); // fetch user information

module.exports = router;
