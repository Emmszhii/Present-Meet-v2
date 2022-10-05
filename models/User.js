const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const userSchema = new mongoose.Schema({
  account_id: String,
  first_name: String,
  last_name: String,
  birthday: String,
  type: String,
});

const studentSchema = new mongoose.Schema({
  account_id: String,
  descriptor: String,
});

const teacherSchema = new mongoose.Schema({
  account_id: String,
  class_Id: String,
  section: String,
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('teacher', teacherSchema);

module.exports = { Account, User, Student, Teacher };
