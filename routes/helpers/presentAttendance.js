const { Teacher, Classroom, Attendance } = require('../../models/Class');

const students = async (attendance_id) => {
  const attendance = await Attendance.findOne({ _id: attendance_id })
    .populate({
      path: 'present',
    })
    .populate({
      path: 'late',
    });
  console.log(attendance);
  if (!attendance) return { err: `No attendance` };
  return { attendance };
};

const restrictMultipleAttendance = async (classId) => {
  // restrict creating multiple attendance
  const { minutes, seconds } = await Classroom.findOne({ _id: classId })
    .populate({
      path: 'attendance_id',
    })
    .then((data) => {
      const attendance_id = data.attendance_id;
      const lastAttendance = attendance_id[attendance_id.length - 1];
      const created = lastAttendance.createdAt;
      const today = new Date().toISOString();
      const difference = new Date(today) - created;

      // const diff = timeSince(created);
      const seconds = difference / 1000;
      let interval = seconds / 60;
      if (interval > 1 && seconds > 60) {
        const minutes = Math.floor(seconds / 60);
        return { minutes };
      }
      return { seconds };
    });

  if (minutes < 15)
    return {
      minutes,
      err: `Request Timeout! Request again after ${15 - minutes} minute(s)`,
    };

  if (seconds)
    return {
      seconds,
      err: `Request Timeout! Request again after ${60 - seconds} second(s)`,
    };
};

module.exports = { students, restrictMultipleAttendance };
