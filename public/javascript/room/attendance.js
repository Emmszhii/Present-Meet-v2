import { postRequest, getRequest, controller } from '../helpers/helpers.js';
import { roomLoaderHandler } from './room.js';
import { rtc, rtm, userData } from './rtc.js';
import { users } from './rtm.js';
import {
  startingInterval,
  startingMinutes,
  startingSeconds,
  end_time,
} from './face_recognition.js';
import { errorMsg, warningMsg } from './msg.js';

const classroom = [];
const students = [];

let time = startingMinutes * startingSeconds;
let interval;

const updateCountdown = () => {
  const minutes = Math.floor(time / 60);
  time--;
  console.log(time);
  let seconds = time % 60;

  const countdown = document.getElementById('take_attendance');
  if (countdown) {
    countdown.innerHTML = `Attendance taking... ${seconds}`;
  }

  if (time <= end_time) {
    stopTimer();
  }
};

const stopTimer = () => {
  clearInterval(interval);

  const btn = document.getElementById('take_attendance');
  if (!btn) return;
  if (btn.classList.contains('on')) {
    btn.classList.remove('on');
  }
  btn.innerHTML = `Attendance <span><i class='fa-solid fa-check'></i></span>`;
  btn.value = 'off';
  time = startingMinutes * startingSeconds;
};

// Teacher host
const attendanceBtn = () => {
  return `
    <button class='button' id='attendance-btn'><i class='fa-solid fa-clipboard-user'></i></button>
  `;
};

const attendanceDom = () => {
  return `
    <section id="attendance__container">
      <div class="svg_spinner" id="attendance_loader"></div>
      <div id='settings_attendance'></div>
      <div id="classroom"></div>
      <div id="classroom_info"></div>
      <div id="students"></div>
    </section>
  `;
};

const checkStudentDescriptor = async (data) => {
  const { MemberId, displayName, descriptor } = data;

  const dbStudentDescriptor = await getStudentDescriptor(MemberId);

  const dbFloatArr = dbStudentDescriptor.split(',');
  const studentDescriptor = new Float32Array(dbFloatArr);
  const queryFloatArr = descriptor.split(',');
  const query = new Float32Array(queryFloatArr);

  try {
    const dist = await faceapi.euclideanDistance(studentDescriptor, query);
    const threshold = 0.4;
    if (dist <= threshold) {
      console.log(`registering attendance`);
    } else {
      warningMsg(`User ${displayName} request is invalid`);
    }
  } catch (e) {
    errorMsg(`Invalid request of user ${displayName}`);
    console.log(e);
  }
};

const getStudentDescriptor = async (id) => {
  try {
    const url = `student-descriptor/${id}`;
    const { data, err } = await getRequest(url);
    if (err) return err;
    if (data) return data;
  } catch (e) {
    console.log(e);
  }
};

// attendance teacher handler
const makeAttendanceHandler = () => {
  document
    .querySelector('.rightBtn')
    .insertAdjacentHTML('afterbegin', attendanceBtn());

  document
    .getElementById('attendance-btn')
    .addEventListener('click', attendance);
};

const restrictToggleHandler = () => {
  document
    .getElementById('settings_attendance')
    .insertAdjacentHTML('beforeend', restrictDom());

  document.getElementById('restrict').addEventListener('click', restrictMode);

  document
    .getElementById('take_attendance')
    .addEventListener('click', takeAttendanceHandler);
};

const restrictMode = (e) => {
  const btn = e.currentTarget;
  if (btn.value === 'off') {
    btn.value = 'on';
    btn.classList.toggle('on');
    btn.textContent = 'Restriction On';
    attendanceCheckHandler();
  } else {
    btn.value = 'off';
    btn.classList.toggle('on');
    btn.textContent = 'Restriction Off';
    attendanceCheckHandler();
  }
};

const takeAttendanceHandler = async (e) => {
  const btn = e.currentTarget;

  if (btn.value === 'off') {
    btn.value = 'on';
    btn.classList.toggle('on');
    interval = setInterval(updateCountdown, startingInterval);
    sendToStudentAttendance();
  } else {
    btn.value = 'off';
    btn.classList.toggle('on');
    stopTimer();
  }
};

const sendToStudentAttendance = () => {
  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'attendance_on',
      id: userData._id,
    }),
  });
};

const checkDbAttendance = async () => {
  const url = `/get-attendance`;
  const postData = '';
  const { data, msg, err } = await fetch(url);
};

const restrictionChecker = () => {
  const id = document.getElementById('classroom_list').value;
  const restrictVal = document.getElementById('restrict').value;

  const arrId = classroom[0].map((item) => item._id);

  if (!arrId.includes(id) && restrictVal === 'on') return true;
  return false;
};

const attendanceCheckHandler = () => {
  const val = restrictionChecker();
  if (val) {
    document.getElementById('take_attendance').disabled = true;
  } else {
    document.getElementById('take_attendance').disabled = false;
  }
};

const restrictDom = () => {
  return `
    <div class='form-group'>
      <button class='button-box off' id='restrict' value='off'>Restriction Off</button>
    </div>
    <div class='form-group'>
      <button class='button-box off' id='take_attendance' value='off'>Attendance Off</button>
    </div>
  `;
};

const attendance = async () => {
  roomLoaderHandler();
  const btn = document.getElementById('attendance-btn');
  const videoCallContainer = document.querySelector('.videoCall');
  const attendanceContainer = document.getElementById('attendance__container');

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    if (attendanceContainer) attendanceContainer.remove();
    classroom.length = 0;
    students.length = 0;
    roomLoaderHandler();
  } else {
    btn.classList.add('active');
    videoCallContainer.insertAdjacentHTML('beforeend', attendanceDom());

    loaderHandler();
    restrictToggleHandler();

    try {
      const { data, msg, err } = await get_classroom();
      if (data) {
        classroom.push(data);
        dropDownList(data);
      }
      if (msg) console.log(msg);
      if (err) console.log(err);
    } catch (e) {
      if (e.name === 'TypeError') return;
      console.log(e);
      console.log(e.name);
    } finally {
      roomLoaderHandler();
    }
  }
};

const createAttendance = async (id) => {
  const url = `/create-attendance`;
  const data = await postRequest(url, id);
  return data;
};

const dropDownList = (info) => {
  const classroomDom = document.getElementById('classroom');
  const classroomList = document.getElementById('classroom_list');
  const data = info;

  const select = document.createElement('select');
  select.name = 'classroom';
  select.id = 'classroom_list';

  const title = document.createElement('option');
  title.text = 'Select a classroom list';
  title.selected = true;
  title.disabled = true;
  title.hidden = true;
  select.appendChild(title);

  for (const [index, values] of data.entries()) {
    const option = document.createElement('option');
    option.value = values._id;
    option.text = values._id;
    select.appendChild(option);
  }

  const label = document.createElement('label');
  label.innerHTML = 'List of classroom available';
  label.htmlFor = 'classroom';

  if (!classroomList) {
    classroomDom.appendChild(label);
    classroomDom.appendChild(select);
  }
  select.addEventListener('change', listDropdown);
};

const loaderHandler = () => {
  const loaderDom = document.getElementById('attendance_loader');
  if (loaderDom) loaderDom.classList.toggle('svg_spinner');
};

const listDropdown = (e) => {
  loaderHandler();
  attendanceCheckHandler();
  // document.querySelector(`.svg_spinner`).style.display = 'block';
  const restrictBtn = document.getElementById('restrict');
  if (!restrictBtn.classList.contains('on')) {
    restrictBtn.classList.toggle('on');
    restrictBtn.value = 'on';
    restrictBtn.textContent = 'Restriction On';
  }

  const id = e.currentTarget.value;
  const val = searchDataInArr(classroom[0], id);
  const dom = document.getElementById('classroom_info');

  dom.innerHTML = ``;

  if (dom)
    document
      .getElementById('classroom_info')
      .insertAdjacentHTML('beforeend', infoDom(val));

  getStudents(id);
};

const infoDom = (val) => {
  return `
    <h3 id='subject'>Subject : ${val.subject} </h3>
    <h3 id='year_level'>Year Level : ${val.year_level}</h3>
    <h3 id='section'>Section : ${val.section}</h3>
    <h3 id='students_total'>Student(s) Total : ${val.students.length}</h3>
  `;
};

const searchDataInArr = (arr, id) => {
  for (const [index, value] of arr.entries()) {
    if (id === value._id) {
      return value;
    }
  }
};

const getStudents = async (id) => {
  const studentsDom = document.getElementById('students');
  studentsDom.innerHTML = ``;
  const url = `/get_students/${id}`;
  try {
    const { data, msg, err } = await getRequest(url);
    if (data) {
      students.push(data);
      if (students.length > 1) students.shift();
      studentsToDom(data);
    }
    if (msg) {
      studentsDom.insertAdjacentHTML('beforeend', noStudentsDom());
    }
    if (err) console.log(err);
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
    // document.querySelector(`.svg_spinner`).style.display = 'none';
  }
};

const studentsToDom = (info) => {
  const dom = document.getElementById('students');
  const data = info;
  for (const [index, value] of data.entries()) {
    dom.insertAdjacentHTML('beforeend', studentsDom(value));
  }
};

const noStudentsDom = () => {
  return `
    <h3 id="no_students">No student registered</h3>
  `;
};

const studentsDom = (val) => {
  return `
    <div class='member__wrapper' id='${val._id}'>
      <span class='icon_user_${val._id} red__icon'></span>
      <p>${val.last_name}, ${val.first_name}</p>
    </div>
  `;
};

const get_classroom = async () => {
  try {
    const url = `/get_classroom`;
    const data = await getRequest(url);
    return data;
  } catch (e) {
    if (e.name === 'AbortError') return;
    console.log(e);
  }
};

export { makeAttendanceHandler, checkStudentDescriptor };
