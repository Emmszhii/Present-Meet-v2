const { capitalize } = require('../helpers/functions');

const { Account, User } = require('../../models/User.js');

const getProfile = (req, res) => {
  const { first_name, middle_name, last_name, birthday, type } = req.user;
  res.render('profile', {
    first_name,
    middle_name,
    last_name,
    birthday,
    type,
  });
};

const postProfile = async (req, res) => {
  let { first_name, middle_name, last_name, birthday, type, password } =
    req.body;
  if (!first_name || !last_name || !birthday || !type || !password)
    return res
      .status(400)
      .json({ err: 'Please fill in all the required fields' });

  // check if first_name is valid
  if (first_name < 3 || first_name.trim() === '')
    return res
      .status(400)
      .json({ err: 'First name must contain at least 3 letters' });
  if (!middle_name) middle_name = '';
  // if (middle_name < 3)
  //   return res
  //     .status(400)
  //     .json({ err: `Middle name must contain at least 3 or more letters` });
  // if (middle_name.trim() === ``)
  //   return res.status(400).json({ err: `Middle name is empty` });

  // check if last_name is valid
  if (last_name < 3 || last_name.trim() === '')
    return res
      .status(400)
      .json({ err: 'Last name must contain at least 3 letter' });

  // check if birthday is not null
  if (birthday.trim() === '')
    return res.status(400).json({ err: 'Must input a birthday' });

  // check if type is not null
  if (type.trim() === '' && type !== 'student' && type !== 'teacher')
    return res.status(400).json({ err: 'Please input a valid account type' });

  try {
    const data = {
      first_name: capitalize(first_name),
      middle_name: capitalize(middle_name),
      last_name: capitalize(last_name),
      birthday: birthday,
      type: type,
    };

    const account = await Account.findOne({ _id: req.user._id });
    const booleanPassword = await comparePassword(password, account.password);

    if (booleanPassword) {
      User.updateOne({ _id: req.user._id }, data, (error, result) => {
        if (error) return res.status(400).json({ err: error });
        if (result.acknowledged)
          return res.status(200).json({ msg: 'User info has been updated' });
        if (!result.acknowledged)
          return res.status(400).json({ err: 'Something gone wrong' });
      });
    } else {
      return res.status(400).json({ err: `Invalid password` });
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ err: `Something went wrong` });
  }
};

module.exports = { getProfile, postProfile };
