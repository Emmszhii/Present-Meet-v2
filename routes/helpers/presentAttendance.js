const { Teacher, Classroom, Attendance } = require('../../models/Class');

const students = async (data) => {
  const { attendance_id, classroom_id } = data;
  if (attendance_id) {
    const attendance = await Attendance.findOne({ _id: attendance_id })
      .populate({
        path: 'present',
      })
      .populate({
        path: 'late',
      });
    if (!attendance) return { err: `No attendance` };
    return { attendance };
  }
  if (classroom_id) {
    const attendance = await Classroom.findOne({ _id: classroom_id })
      .populate({
        path: 'attendance_id',
      })
      .then((data) => {
        const attendance = data.attendance_id;
        const lastAttendance = attendance[attendance.length - 1];
        if (!lastAttendance) return;
        const created = lastAttendance.createdAt;
        const today = new Date().toISOString();
        const difference = new Date(today) - created;

        const seconds = difference / 1000;
        const minutes = Math.floor(seconds / 60);

        if (minutes < 15) return lastAttendance;
        if (seconds > 60 && seconds <= 60) return lastAttendance;
        return;
      });

    if (!attendance) return;
    if (attendance) return attendance;
  }
};

const restrictMultipleAttendance = async (classId) => {
  // restrict creating multiple attendance
  const classroom = await Classroom.findOne({ _id: classId })
    .populate({
      path: 'attendance_id',
    })
    .then((data) => {
      if (data.attendance_id.length === 0) return { msg: `ok` };
      const attendance_id = data.attendance_id;
      const lastAttendance = attendance_id[attendance_id.length - 1];
      const created = lastAttendance.createdAt;
      const today = new Date().toISOString();
      const difference = new Date(today) - created;

      // const diff = timeSince(created);
      const seconds = difference / 1000;
      const minutes = seconds / 60;
      if (minutes > 1) return { minutes: Math.floor(minutes) };
      if (seconds > 0 && seconds <= 60) return { seconds };
    });
  let err;
  const { minutes, seconds, msg } = classroom;
  if (msg) err = `none`;

  if (minutes < 15)
    err = `Request Timeout! Request again after ${15 - minutes} minute(s)`;

  if (seconds > 60 && seconds <= 60)
    err = `Request Timeout! Request again after ${60 - seconds} second(s)`;

  return { err };
};

module.exports = { students, restrictMultipleAttendance };
