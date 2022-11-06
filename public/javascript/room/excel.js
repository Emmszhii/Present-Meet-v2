import { postRequest } from '../helpers/helpers.js';
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
        item.activity = 'present';
        const user = document.getElementById(`icon_user_${_id}`);
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
    changeIcon(id);

    prevState = 'red__icon';
  } else if (btn.classList.contains('green_icon')) {
    changeIcon(id);
    prevState = 'green__icon';
  } else {
    changeIcon(id);
    prevState = 'orange__icon';
  }
};

// const getAllStudents = async () => {
//   await getAllUsers();
// };

const allStudentsDomHandler = async () => {
  try {
    const studentDom = document.getElementById('students');
    const classroomInfo = document.getElementById('classroom_info');
    const selectId = document.getElementById('classroom_list');
    if (selectId) selectId.value = selectId.firstChild.value;
    if (studentDom.firstChild) studentDom.innerHTML = ``;
    if (classroomInfo.firstChild) classroomInfo.innerHTML = ``;
    if (!studentDom) return console.log(`err`);
    await getAllUsers();
    student.forEach((item) => {
      studentDom.insertAdjacentHTML('beforeend', studentsDom(item));
      const user = document.getElementById(`icon_user_${item._id}`);
      if (user) user.addEventListener('click', changeActivityStudent);
      if (item.activity === 'present') presentStudent(item._id);
      if (item.activity === 'late') lateStudent(item._id);
    });
  } catch (e) {
    console.log(e);
  }
};

const excelFileHandler = async () => {
  console.log(`run`);
  const exportBtn = document.getElementById('export_attendance');
  const classroomDom = document.getElementById('classroom_info');
  const studentDom = document.getElementById('students');
  const selectBtn = document.getElementById('classroom_list');
  if (classroomDom.firstChild) classroomDom.innerHTML = ``;
  if (studentDom.firstChild) studentDom.innerHTML = ``;
  if (selectBtn.value) {
    selectBtn.value = '';
    selectBtn.textContent = 'Select a classroom list';
    selectBtn.hidden = true;
    selectBtn.disabled = true;
  }

  try {
    if (!exportBtn && student.length > 0) {
      document
        .getElementById('settings_attendance')
        .insertAdjacentHTML('beforeend', domExportAttendanceBtn());

      const studentDom = document.getElementById('students');
      if (studentDom && student.length > 0)
        student.forEach((item) => {
          studentDom.insertAdjacentHTML('beforeend', studentsDom(item));
          const user = document.getElementById(`icon_user_${item._id}`);
          console.log(user);
          if (user) user.addEventListener('click', changeActivityStudent);
          if (item.activity === 'present') presentStudent(item._id);
          if (item.activity === 'late') lateStudent(item._id);
        });

      document
        .getElementById('export_attendance')
        .addEventListener('click', exportExcelAttendance);
    }
  } catch (e) {
    console.log(e);
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
    student.length = 0;
    teacher.length = 0;
    const users = await rtm.channel.getMembers();
    const url = `/get-all-users-info`;
    const { data, msg, err } = await postRequest(url, users);
    if (err) errorMsg(err);
    if (!data) return;
    if (data) {
      data.map((user) => {
        if (user.type === 'student') {
          const data = { ...user, activity: 'absent' };
          student.push(data);
        }
        if (user.type === 'teacher') teacher.push(user);
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const exportExcelAttendance = async () => {
  const now = new Date().toISOString();
  const dateNowToUtc = new Date().toUTCString();
  const wb = XLSX.utils.book_new();

  const teacherArr = teacher.map((user) => ({
    FirstName: user.first_name,
    LastName: user.last_name,
  }));
  teacherArr.push({});
  console.log(teacherArr);

  const studentArr = student.map((user) => ({
    FirstName: user.first_name,
    LastName: user.last_name,
    activity: user.activity,
  }));
  studentArr.push({});
  console.log(studentArr);

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

export {
  allStudentsDomHandler,
  createExcelAttendance,
  excelFileHandler,
  teacher,
  student,
};
