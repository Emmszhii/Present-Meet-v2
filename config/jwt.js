const jwt = require('jsonwebtoken');

const createJsonToken = (data, expire) => {
  return jwt.sign({ data }, process.env.SESSION_SECRET, {
    expiresIn: expire,
  });
};

const verifyJsonToken = (token) => {
  try {
    return jwt.verify(token, process.env.SESSION_SECRET);
  } catch (e) {
    return e.message;
  }
};

module.exports = {
  createJsonToken,
  verifyJsonToken,
};
