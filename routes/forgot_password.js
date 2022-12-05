const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.post('/forgot-password', async (req, res) => {
  console.log(req.body);
  const data = req.body;
  res.status(200).json({ data });
});

module.exports = router;
