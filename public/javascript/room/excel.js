import { postRequest } from '../helpers/helpers.js';
import { errorMsg } from './msg.js';
import { meetingId } from './room.js';
import { rtm } from './rtc.js';
import { studentsDom } from './attendance.js';
import {
  presentStudent,
  lateStudent,
  absentStudent,
} from './icon_attendance.js';
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

const excelFileHandler = () => {
  const exportBtn = document.getElementById('export_attendance');

  if (!exportBtn) {
    document
      .getElementById('settings_attendance')
      .insertAdjacentHTML('beforeend', domExportAttendanceBtn());

    document
      .getElementById('export_attendance')
      .addEventListener('click', exportExcelAttendance);
  }
  const studentDom = document.getElementById('students');
  if (studentDom && student.length > 0)
    student.forEach((item) => {
      studentDom.insertAdjacentHTML('beforeend', studentsDom(item));
      if (item.activity === 'present') presentStudent(item._id);
      if (item.activity === 'late') lateStudent(item._id);
    });
};

const studentRestrictOffHandler = () => {
  
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

export { createExcelAttendance, excelFileHandler, teacher, student };
