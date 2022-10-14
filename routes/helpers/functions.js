const bcrypt = require('bcrypt');

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

module.exports = {
  capitalize,
  validateName,
  validateNameEmpty,
  validateEmpty,
  comparePassword,
  generateHashPassword,
};
