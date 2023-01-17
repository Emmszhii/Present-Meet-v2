const { comparePassword, faceApiThreshold } = require('../helpers/functions');
const { Account, User, Student } = require('../../models/User');

const faceRecognitionPage = (req, res) => {
  req.user.type === 'student'
    ? res.render('face_recognition')
    : res.redirect('/');
};

const getThreshold = async (req, res) => {
  console.log(+process.env.THRESHOLD);
  res.status(200).json({ threshold: +process.env.THRESHOLD });
};

const getTinyFaceOptions = (req, res) => {
  res.status(200).json({
    inputSize: +process.env.INPUT_SIZE,
    scoreThreshold: +process.env.SCORE_THRESHOLD,
  });
};

const getDescriptor = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id });
    if (!student)
      return res
        .status(200)
        .json({ warning: `Please register your face descriptor` });

    if (student.descriptor)
      return res.status(200).json({
        descriptor: student.descriptor,
        threshold: faceApiThreshold,
        msg: 'User face descriptor is now added',
      });
  } catch (e) {
    console.log(e);
  }
};

const changeDescriptor = async (req, res) => {
  const descriptor = req.body.descriptor;
  const password = req.body.password;
  if (descriptor.trim() === ``)
    return res.status(400).json({ err: 'Face is not valid' });
  if (password.trim() === ``)
    return res.status(400).json({ err: 'Password is invalid' });
  const float = descriptor.split(',');
  if (!descriptor) return res.status(400).json({ err: 'No Face detected' });
  if (float.length !== 128)
    return res.status(400).json({ err: 'Invalid Face' });

  try {
    const account = await Account.findOne({ _id: req.user._id });
    if (!account) return res.status(400).json({ err: `Invalid request` });

    const booleanPassword = await comparePassword(password, account.password);

    if (!booleanPassword)
      return res.status(400).json({ err: `Invalid Password` });

    Student.updateOne(
      { _id: req.user._id },
      {
        _id: req.user._id,
        descriptor: descriptor,
      },
      { upsert: true },
      (err) => {
        if (err) return res.status(400).json({ err });
        return res.status(200).json({ msg: `/` });
        // res.redirect('/');
      }
    );
  } catch (e) {
    console.log(e);
  }
};

const getStudentDescriptor = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findOne({ _id: id });
    const user = await User.findOne({ _id: id });

    if (!student) return res.status(400).json({ err: `No student found` });
    if (!student.descriptor)
      return res.status(200).json({
        err: `Student ${user.last_name}, ${user.first_name} didn't registered their face descriptor in the database`,
      });

    const data = {
      descriptor: student.descriptor,
      threshold: faceApiThreshold,
      first_name: user.first_name,
      last_name: user.last_name,
    };
    if (student.descriptor) return res.status(200).json({ data });
    return res.status(400).json({ err: `Something went wrong` });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  faceRecognitionPage,
  getThreshold,
  getDescriptor,
  changeDescriptor,
  getStudentDescriptor,
  getTinyFaceOptions,
};
