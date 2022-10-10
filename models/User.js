const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    account_id: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    birthday: String,
    type: String,
  },
  { timestamps: true }
);

const studentSchema = new mongoose.Schema(
  {
    account_id: String,
    descriptor: String,
  },
  { timestamps: true }
);

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { Account, User, Student };
