const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  teacher_id: String,
  attendance_id: Array,
  subject: String,
  section: String,
  students: Array,
});

const attendanceSchema = new mongoose.Schema({
  class_id: String,
  present: Array,
  absent: Array,
});

const Classroom = mongoose.model('Classroom', classroomSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Classroom, Attendance };
