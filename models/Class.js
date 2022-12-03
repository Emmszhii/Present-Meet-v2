const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    classroom_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
  },
  {
    timestamps: true,
  }
);

const classroomSchema = new mongoose.Schema(
  {
    subject: String,
    year_level: String,
    section: String,
    attendance_id: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
    ],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    present: Array,
    late: Array,
    emotions: Array,
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Teacher, Classroom, Attendance };
