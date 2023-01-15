const bcrypt = require('bcrypt');

const faceApiThreshold = process.env.THRESHOLD || 0.42;

const capitalize = (string) => {
  const name = string.toLowerCase().split(' ');

  for (let i = 0; i < name.length; i++) {
    const exist = name[i][0];

    if (exist) name[i] = name[i][0].toUpperCase() + name[i].substr(1);
  }

  return name.join(' ').trim();
};

const validateName = (name) => {
  const regName = /^[a-zA-Z]+( [a-zA-Z]+)+$/;

  if (!regName.test(name)) {
    return false;
  } else {
    return true;
  }
};

const validateNameEmpty = (name) => {
  if (name.length < 3 || name.trim() === ``) return true;
  return false;
};

const validateEmpty = (str) => {
  if (!str || str.trim() === '') return true;
  return false;
};

const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.log(e);
  }
  return false;
};

const generateHashPassword = async (password) => {
  try {
    const rounds = 10;
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (e) {
    console.log(e);
  }
};

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const timeSince = (date) => {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
};

const isHttps = (req, res, next) => {
  const http = req.protocol;
  if (http === 'http') return res.redirect('/connection-secure');
  return next();
};

module.exports = {
  faceApiThreshold,
  isHttps,
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
  generateHashPassword,
  isSameDay,
  timeSince,
};
