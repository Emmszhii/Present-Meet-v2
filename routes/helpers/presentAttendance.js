const { Teacher, Classroom, Attendance } = require('../../models/Class');

const students = async (attendance_id) => {
  const attendance = await Attendance.findOne({ _id: attendance_id })
    .populate({
      path: 'present',
    })
    .populate({
      path: 'absent',
    })
    .populate({
      path: 'late',
    });
  if (!attendance) return { err: `No attendance` };
  return attendance;
};

module.exports = { students };
