import { getRequest, postRequest } from '../helpers/helpers.js';
import { loaderHandler } from './attendance.js';
import { errorMsg, successMsg } from './msg.js';
import { userData } from './rtc.js';

const updateStudentIcon = async (e) => {
  loaderHandler();
  const btn = e.currentTarget;
  const id = e.currentTarget.dataset.id;
  let prevStateIcon;
  try {
    if (btn.classList.contains('red__icon')) {
      btn.classList.toggle('red__icon');
      btn.classList.toggle('green__icon');
      prevStateIcon = `red__icon`;
    } else if (btn.classList.contains('green__icon')) {
      btn.classList.toggle('green__icon');
      btn.classList.toggle('orange__icon');
      prevStateIcon = `green__icon`;
    } else {
      btn.classList.toggle('orange__icon');
      btn.classList.toggle('red__icon');
      prevStateIcon = `orange__icon`;
    }
    const { data, msg, err } = await updateStudentAttendance(btn, id);
    if (err) {
      removedClassIcon(btn);
      btn.classList.toggle(prevStateIcon);
      errorMsg(err);
    }
    if (data) successMsg(msg);
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

const presentStudent = async (id) => {
  const user = document.getElementById(`icon_user_${id}`);

  if (!user) return;
  if (user.classList.contains('red__icon')) {
    user.classList.toggle('red__icon');
    user.classList.toggle('green__icon');
  }
  if (user.classList.contains('orange__icon')) {
    user.classList.toggle('orange__icon');
    user.classList.toggle('green__icon');
  }
};
const lateStudent = async (id) => {
  const user = document.getElementById(`icon_user_${id}`);
  if (!user) return;
  if (user.classList.contains('red__icon')) {
    user.classList.toggle('red__icon');
    user.classList.toggle('orange__icon');
  }
  if (user.classList.contains('green__icon')) {
    user.classList.toggle('green__icon');
    user.classList.toggle('orange__icon');
  }
};

const getStudentPresentHandler = async () => {
  loaderHandler();
  try {
    const { listOfStudents } = await checkPresent();
    if (!listOfStudents) return;

    userData.attendance_id = listOfStudents._id;
    const present = listOfStudents.present;
    const late = listOfStudents.late;

    for (const [index, id] of present.entries()) {
      presentStudent(id);
    }

    for (const [index, id] of late.entries()) {
      lateStudent(id);
    }
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

const removedClassIcon = (btn) => {
  const present = btn.classList.contains('green__icon');
  const absent = btn.classList.contains('red__icon');
  const late = btn.classList.contains('orange__icon');
  if (present) btn.classList.remove('green__icon');
  if (absent) btn.classList.remove('red__icon');
  if (late) btn.classList.remove('orange__icon');
};

const updateStudentAttendance = async (btn, id) => {
  const student_id = id;
  const present = btn.classList.contains('green__icon');
  const absent = btn.classList.contains('red__icon');
  const late = btn.classList.contains('orange__icon');
  const classroom_id = document.getElementById('classroom_list').value;
  const attendance_id = userData.attendance_id;
  const result = { student_id, classroom_id, attendance_id };
  if (present) result.user = 'present';
  if (absent) result.user = 'absent';
  if (late) result.user = 'late';
  const url = `/student-attendance`;
  const { data, msg, err } = await postRequest(url, result);
  if (err) return err;
  if (data) return { data, msg };
};

const checkPresent = async () => {
  const url = `/check-present`;
  const classroom_id = document.getElementById('classroom_list').value;
  const postData = { classroom_id };
  const data = await postRequest(url, postData);
  return data;
};

export { updateStudentIcon, presentStudent, getStudentPresentHandler };
