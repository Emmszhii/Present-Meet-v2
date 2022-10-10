const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    teacher_id: String,
    classroom_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
  },
  {
    timestamps: true,
  }
);

const classroomSchema = new mongoose.Schema(
  {
    teacher_id: String,
    attendance_id: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
    ],
    subject: String,
    section: String,
    students: Array,
  },
  { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    date: Date,
    present: Array,
    absent: Array,
  },
  { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = { Teacher, Classroom, Attendance };
