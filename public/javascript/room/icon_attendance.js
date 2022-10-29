import { postRequest } from '../helpers/helpers.js';
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
      return errorMsg(err);
    }
    if (data) return successMsg(msg);
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

export { updateStudentIcon };
