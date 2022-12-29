// User model
const { User } = require('../../models/User');
const { Classroom } = require('../../models/Class');

const getStudentsInfo = async (req, res) => {
  const arr = req.body;
  if (!Array.isArray(arr))
    return res.status(400).json({ err: `Invalid Request` });
  if (!arr) return res.status(400).json({ err: `Invalid Request` });

  const users = await User.find({ _id: { $in: arr } });
  if (!users) return res.status(400).json({ err: `No users found` });

  if (arr) return res.status(200).json({ data: users });
};

const allAttendanceInClassroom = async (req, res) => {
  const id = req.params.id;
  if (req.user.type !== 'teacher')
    return res.status(400).json({ err: 'Invalid Request' });
  if (!id) return res.status(400).json({ err: `Invalid ID` });
  if (id === 'none') return res.status(400).json({ err: `Invalid ID` });

  try {
    const classroomId = await Classroom.findOne({ _id: id }).populate({
      path: `attendance_id`,
    });

    if (!classroomId) return res.status(400).json({ err: `No Class found!` });

    const user = await User.findOne({ _id: req.user._id });

    if (!user) return res.status(400).json({ err: `Invalid Request` });

    const { _id: teacherId, first_name, last_name, middle_name } = user;
    const {
      _id,
      subject,
      year_level,
      section,
      createdAt,
      updatedAt,
      students: studentsId,
    } = classroomId;

    const students = [];
    for (const id of studentsId) {
      const user = await User.findOne({ _id: id });
      if (!user) return;
      students.push(user);
    }

    students.sort((a, b) =>
      a.last_name > b.last_name ? 1 : b.last_name > a.last_name ? -1 : 0
    );

    const attendance = classroomId.attendance_id.map((item) => item);

    return res.status(200).json({
      data: {
        attendance,
        _id,
        subject,
        year_level,
        section,
        createdAt,
        updatedAt,
        teacherId,
        first_name,
        last_name,
        middle_name,
        students,
      },
      msg: `class found`,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = { getStudentsInfo, allAttendanceInClassroom };
