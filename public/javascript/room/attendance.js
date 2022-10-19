import { postRequest, getRequest, svgLoader } from '../helpers/helpers.js';
import { users } from './rtm.js';

const classroom = [];
const students = [];

// Teacher host
const attendanceBtn = () => {
  return `
    <button class='button' id='attendance-btn'><i class='fa-solid fa-clipboard-user'></i></button>
  `;
};

const attendanceDom = () => {
  return `
    <section id="attendance__container">
      <div class="svg_spinner"></div>
      <div id="classroom"></div>
      <div id="classroom_info"></div>
      <div id="students"></div>
    </section>
  `;
};

// attendance teacher handler
const makeAttendanceHandler = (e) => {
  document
    .querySelector('.rightBtn')
    .insertAdjacentHTML('afterbegin', attendanceBtn());

  document
    .getElementById('attendance-btn')
    .addEventListener('click', attendance);
};

const attendance = async () => {
  const btn = document.getElementById('attendance-btn');
  const videoCallContainer = document.querySelector('.videoCall');
  const attendanceContainer = document.getElementById('attendance__container');

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    if (attendanceContainer) attendanceContainer.remove();
    classroom.length = 0;
    students.length = 0;
  } else {
    btn.classList.add('active');
    videoCallContainer.insertAdjacentHTML('beforeend', attendanceDom());
    const classroomDom = document.getElementById('classroom');

    try {
      const { data, msg, err } = await get_classroom();
      if (data) {
        classroom.push(data);
        dropDownList(data);
      }
      if (msg) console.log(msg);
      if (err) console.log(err);
    } catch (e) {
      console.log(e);
    } finally {
      document.querySelector(`.svg_spinner`).style.display = 'none';
    }
  }
};

const dropDownList = (info) => {
  const classroomDom = document.getElementById('classroom');
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

  classroomDom.appendChild(label);
  classroomDom.appendChild(select);

  select.addEventListener('change', listDropdown);
};

const listDropdown = (e) => {
  document.querySelector(`.svg_spinner`).style.display = 'block';
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
    <h3 id='students_total'>Students Total: ${val.students.length}</h3>
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
    document.querySelector(`.svg_spinner`).style.display = 'none';
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
    console.log(e);
  }
};

export { makeAttendanceHandler };
