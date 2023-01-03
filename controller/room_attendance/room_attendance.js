const {
  students,
  restrictMultipleAttendance,
} = require('../helpers/presentAttendance');

const { Teacher, Classroom, Attendance } = require('../../models/Class');

const createAttendance = async (req, res) => {
  const restrict = req.params.restrict;
  const { meetingId, id: classId } = req.body;
  if (restrict !== 'on' && restrict !== 'off')
    return res.status(400).json({ err: `Invalid restriction request` });
  if (!meetingId)
    return res.status(400).json({ err: `Invalid channel request` });

  try {
    if (restrict === 'on') {
      const teacher = await Teacher.findOne({ _id: req.user._id });
      if (!teacher) return res.status(400).json({ err: `Invalid request` });
      const classroom = await Classroom.findOne({ _id: classId });
      if (!classroom) return res.status(400).json({ err: `Invalid request` });

      if (classroom.students.length === 0)
        return res.status(400).json({ err: `No student(s) registered` });

      const { err } = await restrictMultipleAttendance(classId);

      if (err !== 'none') return res.status(400).json({ err });

      const attendance = new Attendance();
      classroom.attendance_id.push(attendance._id);
      console.log(attendance);
      console.log(classroom);
      await attendance.save();
      await classroom.save();

      return res.status(200).json({
        data: {
          attendance_id: attendance._id,
        },
      });
    } else {
      res.status(200).json({ msg: `Not yet implemented` });
    }
  } catch (e) {
    res.status(400).json({ err: `Something went wrong` });
    console.log(e);
  }
};

const addStudentAttendance = async (req, res) => {
  const { attendance_id, classroom_id, student_id } = req.body;

  try {
    const classroom = await Classroom.findOne({ _id: classroom_id });
    if (!classroom) return res.status(400).json({ err: `No classroom found` });

    const student = await Classroom.findOne({ _id: classroom_id }).populate({
      path: 'students',
      match: { _id: student_id },
    });
    if (!student)
      return res.status(400).json({ err: `Student not found in the database` });

    const attendance = await Attendance.findOne({ _id: attendance_id });
    if (!attendance)
      return res
        .status(400)
        .json({ err: `No attendance file created in the database` });

    attendance.present.push(student_id);
    await attendance.save();

    const data = await students({ attendance_id });
    const queryStudent = student.students[0];
    const firstName = queryStudent.first_name;
    const lastName = queryStudent.last_name;
    return res.status(200).json({
      data,
      msg: `Student ${lastName}, ${firstName} has been saved to the attendance`,
    });
  } catch (e) {
    console.log(e);
  }
};

const toggleStudentAttendance = async (req, res) => {
  const { student_id, classroom_id, attendance_id, user } = req.body;
  if (user !== 'late' && user !== 'present' && user !== 'absent')
    return res.status(400).json({ err: `Invalid user request` });

  const student = await Classroom.findOne({ _id: classroom_id }).populate({
    path: 'students',
    match: { _id: student_id },
  });

  const queryStudent = student.students[0]._id;
  if (!queryStudent) return res.status(400).json({ err: `Invalid student` });

  const attendance = await Attendance.findOne({ _id: attendance_id })
    .populate({ path: 'present', match: { _id: student_id } })
    .populate({ path: 'late', match: { _id: student_id } });
  if (!attendance)
    return res.status(400).json({ err: `Please create new attendance first` });

  const attendanceCreated = new Date(attendance.createdAt);
  const now = new Date(new Date().toISOString());
  const difference = now - attendanceCreated;
  const seconds = difference / 1000;
  const minutes = Math.floor(seconds / 60);

  if (minutes > 15)
    return res.status(400).json({ err: `Please create a new attendance` });

  const isStudentPresent = attendance.present.includes(student_id);
  const isStudentLate = attendance.late.includes(student_id);

  if (user === 'present') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { late: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $push: { present: student_id } }
    );
  }
  if (user === 'late') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { present: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $push: { late: student_id } }
    );
  }
  if (user === 'absent') {
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { present: student_id } }
    );
    await Attendance.updateOne(
      { _id: attendance_id },
      { $pull: { late: student_id } }
    );
  }
  const firstName = student.students[0].first_name;
  const lastName = student.students[0].last_name;

  res.status(200).json({
    msg: `User ${lastName}, ${firstName} is ${user}`,
    data: 'ok',
  });
};

const checkPresent = async (req, res) => {
  const { classroom_id } = req.body;
  const listOfStudents = await students({ classroom_id });
  if (!listOfStudents) return res.status(200).json({});
  return res.status(200).json({ listOfStudents });
};

module.exports = {
  createAttendance,
  addStudentAttendance,
  toggleStudentAttendance,
  checkPresent,
};
