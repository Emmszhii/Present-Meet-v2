const jwt = require('jsonwebtoken');

const createJsonToken = (id, expire) => {
  const token = jwt.sign({ id }, process.env.SESSION_SECRET, {
    expiresIn: expire,
  });
  return token;
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
