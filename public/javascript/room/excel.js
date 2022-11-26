import { getRequest, postRequest } from '../helpers/helpers.js';
import { errorMsg } from './msg.js';
import { meetingId } from './room.js';
import { rtm } from './rtc.js';
import { studentsDom } from './attendance.js';
import {
  presentStudent,
  lateStudent,
  absentStudent,
  changeIcon,
} from './icon_attendance.js';
import { searchDataInArr } from '../helpers/helpers.js';
import { loaderHandler } from './attendance.js';

const student = [];
const teacher = [];
let state = null;

const createExcelAttendance = async (data) => {
  const { meetingId, _id, first_name, last_name } = data;

  try {
    if (student.length === 0 && teacher.length === 0) await getAllUsers();
  } catch (e) {
    console.log(e);
  } finally {
    excelFileHandler();
    student.forEach((item) => {
      if (item._id === _id) {
        const user = document.getElementById(`icon_user_${_id}`);
        item.activity = 'present';
        if (user) presentStudent(_id);
      }
    });
  }
};

const changeActivityStudent = (e) => {
  const btn = e.currentTarget;
  const id = e.currentTarget.dataset.id;
  const user = searchDataInArr(student, id);
  if (!user) return errorMsg('No User Selected');
  let prevState;
  if (btn.classList.contains('red__icon')) {
    // present
    changeIcon(id);
    prevState = 'red__icon';
    studentChangeActivity(id, 'present');
  } else if (btn.classList.contains('green__icon')) {
    // late
    changeIcon(id);
    prevState = 'green__icon';
    studentChangeActivity(id, 'late');
  } else {
    // absent
    changeIcon(id);
    prevState = 'orange__icon';
    studentChangeActivity(id, 'absent');
  }
  console.log(student);
};

const studentChangeActivity = (id, status) => {
  student.forEach((user) => {
    if (user._id === id) user.activity = status;
  });
};

const allStudentsDomHandler = async () => {
  // loaderHandler();
  try {
    const restrictVal = document.getElementById('restrict').value;
    if (restrictVal === 'on') return;
    clearInfoAndStudentsDom();
    await getAllUsers();
    studentActivity();
  } catch (e) {
    const errArr = [
      { err: `Cannot read properties of null (reading 'value')`, msg: `` },
    ];
    errArr.map((arr) => {
      if (arr.err.includes(e.message)) return;
    });
  } finally {
    // loaderHandler();
  }
};

const clearInfoAndStudentsDom = () => {
  const studentDom = document.getElementById('students');
  const classroomInfo = document.getElementById('classroom_info');
  const selectId = document.getElementById('classroom_list');
  if (selectId) selectId.value = selectId.firstChild.value;
  if (studentDom.firstChild) studentDom.innerHTML = ``;
  if (classroomInfo.firstChild) classroomInfo.innerHTML = ``;
  if (!studentDom) return console.log(`err`);
};

const studentActivity = () => {
  const studentDom = document.getElementById('students');
  student.map((item) => {
    studentDom.insertAdjacentHTML('beforeend', studentsDom(item));
    const user = document.getElementById(`icon_user_${item._id}`);
    if (user) user.addEventListener('click', changeActivityStudent);
    if (!item.activity || item.activity === 'absent') absentStudent(item._id);
    if (item.activity === 'present') presentStudent(item._id);
    if (item.activity === 'late') lateStudent(item._id);
  });
};

const excelFileHandler = async () => {
  const exportBtn = document.getElementById('export_attendance');
  const checkActivity = student.map((user) => {
    if (user.activity === 'present') return true;
    return false;
  });

  if (!exportBtn && checkActivity) {
    document
      .getElementById('settings_attendance')
      .insertAdjacentHTML('beforeend', domExportAttendanceBtn());

    document
      .getElementById('export_attendance')
      .addEventListener('click', exportExcelAttendance);
  }
};

const domExportAttendanceBtn = () => {
  return `
    <div class='form-group'>
      <button class="button-box" id="export_attendance">Export File</button>
    </div>
  `;
};

const getAllUsers = async () => {
  try {
    const users = await rtm.channel.getMembers();
    const url = `/get-all-users-info`;
    const { data, msg, err } = await postRequest(url, users);
    if (err) errorMsg(err);
    if (!data) return;

    if (data) {
      data.map((user) => {
        const studentArrId = student.map((user) => user._id);
        const teacherArrId = teacher.map((user) => user._id);

        if (user.type === 'student' && !studentArrId.includes(user._id))
          student.push(user);

        if (user.type === 'teacher' && !teacherArrId.includes(user._id))
          teacher.push(user);
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const deleteIdInArr = (id) => {
  let type;
  const studentArr = [];
  const teacherArr = [];
  student.map((user) => studentArr.push(user._id));
  teacher.map((user) => teacherArr.push(user._id));
  if (studentArr.includes(id)) type = 'student';
  if (teacher.includes(id)) type = 'teacher';
  if (!type) return;
  if (type === 'student') {
    const index = student.map((user) => user._id).indexOf(id);
    student.splice(index, 1);
    allStudentsDomHandler();
  }
  if (type === 'teacher') {
    const index = teacher.map((user) => user._id).indexOf(id);
    teacher.splice(index, 1);
  }
};

const exportExcelAttendance = async () => {
  const now = new Date().toISOString();
  const dateNowToUtc = new Date().toUTCString();
  const wb = XLSX.utils.book_new();

  student.forEach((user) => {
    if (!user.activity) user.activity = 'absent';
  });

  const teacherArr = teacher.map((user) => ({
    FirstName: user.first_name,
    LastName: user.last_name,
  }));
  teacherArr.push({});

  const studentArr = student.map((user) => ({
    FirstName: user.first_name,
    LastName: user.last_name,
    activity: user.activity,
  }));
  studentArr.push({});

  const wk = XLSX.utils.aoa_to_sheet(
    [
      ['Meeting ID', '', 'Date Created'],
      [meetingId, '', dateNowToUtc],
      ['', '', ''],
    ],
    { origin: 'A1' }
  );

  XLSX.utils.sheet_add_aoa(wk, [['TEACHER']], { origin: -1 });
  XLSX.utils.sheet_add_json(wk, teacherArr, {
    origin: -1,
  });
  XLSX.utils.sheet_add_aoa(wk, [['STUDENT']], { origin: -1 });
  XLSX.utils.sheet_add_json(wk, studentArr, {
    origin: -1,
  });

  XLSX.utils.book_append_sheet(wb, wk, meetingId);
  XLSX.writeFile(wb, `${meetingId}_${now}.xlsx`);
};

const exportAttendanceFromDb = async () => {
  const exportBtn = document.getElementById('export_attendance');
  if (exportBtn) exportBtn.parentElement.remove();
  if (!exportBtn)
    document
      .getElementById('settings_attendance')
      .insertAdjacentHTML('beforeend', domExportAttendanceBtn());

  document
    .getElementById('export_attendance')
    .addEventListener('click', attendanceFromDb);
};

const attendanceFromDb = async () => {
  loaderHandler();
  const id = document.getElementById('classroom_list').value;
  const url = `/all-attendance-classroom/${id}`;
  try {
    const { data, err, msg } = await getRequest(url);
    if (err) return errorMsg(err);

    exportExcelFromDb(data);
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

const exportExcelFromDb = async (data) => {
  const now = new Date().toISOString();
  const dateNowToUtc = new Date().toUTCString();
  const wb = XLSX.utils.book_new();
  const wk = XLSX.utils.aoa_to_sheet(
    [['Classroom ID', '', 'Date Exported'], [data._id, '', dateNowToUtc], ['']],
    { origin: 'A1' }
  );
  const teacher = [
    {
      FirstName: data.first_name,
      MiddleName: data.middle_name,
      LastName: data.last_name,
    },
    {},
  ];

  const date = data.attendance.map((item) =>
    new Date(item.createdAt).toUTCString()
  );

  XLSX.utils.sheet_add_aoa(wk, [['TEACHER']], { origin: -1 });
  XLSX.utils.sheet_add_json(wk, teacher, {
    origin: -1,
  });
  XLSX.utils.sheet_add_aoa(wk, [['STUDENT(S)']], { origin: -1 });
  XLSX.utils.sheet_add_aoa(
    wk,
    [
      [
        `ID`,
        'FirstName',
        'MiddleName',
        'LastName',
        ...date,
        '',
        'Present',
        'Late',
        'Absent',
      ],
    ],
    { origin: -1 }
  );
  data.students.map((student) => {
    const studentId = student._id;
    const FirstName = student.first_name;
    const MiddleName = student.middle_name;
    const LastName = student.last_name;
    const act = [];
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    data.attendance.map((item) => {
      let activity;

      if (item.present.includes(studentId)) {
        activity = 'present';
        totalPresent++;
      } else if (item.late.includes(studentId)) {
        activity = 'late';
        totalLate++;
      } else {
        activity = 'absent';
        totalAbsent++;
      }

      act.push(activity);
    });
    XLSX.utils.sheet_add_aoa(
      wk,
      [
        [
          studentId,
          FirstName,
          MiddleName,
          LastName,
          ...act,
          '',
          totalPresent,
          totalLate,
          totalAbsent,
        ],
      ],
      {
        origin: -1,
      }
    );
  });

  XLSX.utils.book_append_sheet(wb, wk, data._id);
  XLSX.writeFile(wb, `${data._id}_${now}.xlsx`);
};

const restrictOnExportFile = () => {
  const btn = document.getElementById('export_attendance');
  if (!btn) return;
  const parentEl = btn.parentElement;
  if (parentEl) parentEl.remove();
};

export {
  teacher,
  student,
  restrictOnExportFile,
  exportAttendanceFromDb,
  allStudentsDomHandler,
  createExcelAttendance,
  excelFileHandler,
  deleteIdInArr,
  clearInfoAndStudentsDom,
};
