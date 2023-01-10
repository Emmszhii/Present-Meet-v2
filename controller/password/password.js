const {
  generateHashPassword,
  comparePassword,
} = require('../helpers/functions.js');

const { Account } = require('../../models/User.js');

const postChangePassword = async (req, res) => {
  const {
    password: oldPw,
    newPassword: newPw,
    newPassword1: newPw1,
  } = req.body;
  if (!oldPw || !newPw || !newPw1)
    return res
      .status(400)
      .json({ err: 'All fields in password are required!' });
  if (newPw < 6)
    return res
      .status(400)
      .json({ err: 'Password must contain 6 or more characters!' });
  if (newPw !== newPw1)
    return res
      .status(400)
      .json({ err: 'New Password and confirm password is not the same!' });

  const account = await Account.findOne({ _id: req.user._id });
  if (!account) return res.status(200).json({ err: 'Invalid request' });

  const booleanPassword = await comparePassword(oldPw, account.password);
  if (booleanPassword) {
    const hash = await generateHashPassword(newPw);
    Account.updateOne(
      { _id: req.user._id },
      { password: hash },
      (error, result) => {
        if (error) res.status(400).json({ err: 'Something went wrong' });
        if (result.acknowledged) {
          return res.status(200).json({ msg: `Password has been changed` });
        }
      }
    );
  } else {
    res.status(400).json({ err: `Invalid Password` });
  }
};

module.exports = { postChangePassword };
