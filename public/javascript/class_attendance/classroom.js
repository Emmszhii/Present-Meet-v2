import { getRequest, postRequest, randDarkColor } from '../helpers/helpers.js';
import { exportExcelFromDb } from '../helpers/excel.js';
import { successDom, warningDom, errorDom, deleteMsg } from './msg.js';
import {
  students_data,
  fetchStudents,
  listStudentToDom,
  studentTableData,
} from './students.js';
import {
  loaderDom,
  loaderHandler,
  removedOnConfirm,
  onConfirm,
  addTable,
  msgStudentTable,
  domAddClassList,
  domClassList,
  linkDom,
  getClassDom,
  removeChildElement,
  resetClassList,
  noListDom,
  closeParentNode,
  getAttendanceDom,
  addAttendanceTable,
} from './view.js';

const teacher_data = [];

const classListHandler = () => {
  const list = document.getElementById('add_list');
  if (list) return list.remove();
  removeChildElement();
  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', domAddClassList());
  document.querySelector('.close').addEventListener('click', closeParentNode);
  document
    .getElementById(`save_class_btn`)
    .addEventListener('click', saveClassList);
};

const saveClassList = () => {
  document.body.insertAdjacentHTML('beforeend', onConfirm());
  document.getElementById('cancel').addEventListener('click', removedOnConfirm);
  document
    .getElementById('confirm')
    .addEventListener('click', savedNewClassList);
};

const savedNewClassList = async () => {
  const subject = document.getElementById('subject').value;
  const year_level = document.getElementById('year_level').value;
  const section = document.getElementById('section').value;
  const password = document.getElementById('password').value;
  const postData = {
    subject,
    year_level,
    section,
    password,
  };
  const url = '/add-class-list';

  try {
    const { data, err, msg } = await postRequest(url, postData);
    if (data) {
      successDom(msg);
      getClassroomHandler();
      removeChildElement();
    }
    if (err) errorDom(err);
  } catch (e) {
    console.log(e);
  } finally {
    removedOnConfirm();
  }
};

const deleteClassListHandler = () => {
  document.body.insertAdjacentHTML('beforeend', onConfirm());
  document.getElementById('cancel').addEventListener('click', removedOnConfirm);
  document.getElementById('confirm').addEventListener('click', deleteClassList);
};

const deleteClassList = async () => {
  const id = document.getElementById('main_list').dataset.value;
  const password = document.getElementById('password').value;
  const url = `/delete-class-list`;
  try {
    const { data, msg, err } = await postRequest(url, { id, password });
    if (err) errorDom(err);
    if (data) {
      successDom(msg);
      getClassroomHandler();
      removeChildElement();
    }
  } catch (e) {
    console.log(e);
  } finally {
    removedOnConfirm();
  }
};

const getClassToken = async () => {
  const id = document.getElementById('main_list').dataset.value;
  try {
    const time = document.getElementById('link_time').value;
    const url = `/generate-class-token/${id}/${time}`;
    const token = getRequest(url);
    return token;
  } catch (e) {
    console.log(e);
  }
};

const onChangeLinkDropDown = async () => {
  loaderHandler();
  try {
    const { token } = await getClassToken();
    const url = window.location.href;
    const link = `${url}/join-class?token=${token}`;
    document.getElementById('link_classroom').value = link;
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

const copyLink = () => {
  const dom = document.getElementById('link_classroom');
  navigator.clipboard.writeText(dom.value);
};

const studentDomHandler = async () => {
  const expireTime = ['15m', '30m', '1h', '1d', '7d'];
  const id = document.getElementById('main_list').dataset.value;
  const url = window.location.href;

  document.querySelector('.link').insertAdjacentHTML('beforeend', linkDom());

  const linkDropDown = document.getElementById('link_time');

  for (const time of expireTime) {
    const option = new Option();
    option.value = time;
    option.text = time;
    linkDropDown.options.add(option);
  }

  const { token } = await getClassToken();

  const link = `${url}/join-class?token=${token}`;

  document.getElementById('link_classroom').value = link;

  linkDropDown.addEventListener('change', onChangeLinkDropDown);

  document.getElementById('copy').addEventListener('click', copyLink);
};

const editClassHandler = () => {
  const id = document.getElementById('main_list').dataset.value;

  removeChildElement();

  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', domAddClassList());

  const data = searchTeacherDataInArr(id);

  document.querySelector('.close').addEventListener('click', closeParentNode);

  document.getElementById('add_list').dataset.value = id;

  document.getElementById('class_text').textContent = `Edit a CLass List`;
  document.getElementById('subject').value = data.subject;
  document.getElementById('year_level').value = data.year_level;
  document.getElementById('section').value = data.section;

  document
    .getElementById('save_class_btn')
    .addEventListener('click', updateClassHandler);
};

const updateClassHandler = () => {
  document.body.insertAdjacentHTML('beforeend', onConfirm());

  document.getElementById('cancel').addEventListener('click', removedOnConfirm);

  document.getElementById('confirm').addEventListener('click', updateClass);
};

const updateClass = async () => {
  const subject = document.getElementById('subject').value;
  const year_level = document.getElementById('year_level').value;
  const section = document.getElementById('section').value;
  const password = document.getElementById('password').value;
  const id = document.getElementById('add_list').dataset.value;
  const url = `/update-class`;
  const postData = { id, subject, year_level, section, password };
  try {
    const update = await postRequest(url, postData);
    const { data, msg, err } = await update;
    if (data) {
      successDom(msg);
      getClassroomHandler();
      removeChildElement();
    }
    if (err) errorDom(err);
  } catch (e) {
    console.log(e);
  } finally {
    removedOnConfirm();
  }
};

const searchTeacherDataInArr = (id) => {
  const data = teacher_data[0];
  for (let i = 0; data.length > i; i++) {
    if (id === data[i]._id) {
      return data[i];
    }
  }
  return;
};

const infoClass = async (id) => {
  // class info
  const data = searchTeacherDataInArr(id);

  document.getElementById('main_list').dataset.value = data._id;
  document.getElementById('class_id').textContent = `Class ID: ${data._id}`;
  document.getElementById('subject').textContent = `Subject: ${data.subject}`;
  document.getElementById(
    'year_level'
  ).textContent = `Year Level: ${data.year_level}`;
  document.getElementById('section').textContent = `Section: ${data.section}`;
};

const loadClassHandler = async (e) => {
  const id = e.currentTarget.dataset.value;
  loaderHandler();
  try {
    removeChildElement();

    document
      .querySelector('.container_class')
      .insertAdjacentHTML('beforeend', getClassDom());

    document.querySelector('.close').addEventListener('click', closeParentNode);

    await listStudentToDom(id);
    await infoClass(id);
    await studentDomHandler();
    await checkAttendanceFromDb(id);

    document
      .getElementById('edit_class')
      .addEventListener('click', editClassHandler);
    document
      .getElementById('remove_class')
      .addEventListener('click', deleteClassListHandler);
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

const listToDomHandler = () => {
  resetClassList();
  listTeacherToDom();
};

const checkAttendanceFromDb = async (id) => {
  const url = `/all-attendance-classroom/${id}`;
  try {
    const { data, err, msg } = await getRequest(url);
    if (err) return errorDom(err);
    if (data) attendanceFileBtn(data);
  } catch (e) {
    console.log(e);
  }
};

const attendanceFileBtn = (data) => {
  const _id = data._id;
  const attendanceArr = data.attendance;
  if (attendanceArr.length === 0) return;

  document
    .querySelector('.settings')
    .insertAdjacentHTML('beforeend', attendanceBtn());

  document
    .getElementById('attendance_class')
    .addEventListener('click', formAttendance);
};

const formAttendance = async (e) => {
  const _id = document.getElementById('main_list').dataset.value;
  // const dataClass = searchTeacherDataInArr(_id);
  // let dataHtml = ``;
  // let trHtml = ``;
  // removeChildElement();
  // document
  //   .querySelector('.container_class')
  //   .insertAdjacentHTML('beforeend', getAttendanceDom(dataClass));
  // document
  //   .getElementById('attendance_table')
  //   .insertAdjacentHTML('beforeend', addAttendanceTable());
  // const tableData = document.getElementById('tableAttendanceData');
  // const { data: dataStudents } = await fetchStudents(_id);
  const { data: attendanceData, msg } = await allAttendanceFromDb(_id);
  // const attendance = attendanceData.attendance;
  // // console.log(attendanceData);
  // for (const [index, value] of attendance.entries()) {
  //   const utcDate = new Date(value.createdAt).toUTCString();
  //   trHtml += `
  //    <th>${utcDate}</th>
  //   `;
  // }
  // for (const [index, student] of dataStudents.entries()) {
  //   dataHtml += `
  //   <tr>
  //     <td>${student.last_name}</td>
  //     <td>${student.first_name}</td>
  //     <td>${student.middle_name}</td>
  //   </tr>
  //   `;
  // }
  // tableData.innerHTML = dataHtml;
  // document.querySelector('.close').addEventListener('click', closeParentNode);
  console.log(attendanceData);
  exportExcelFromDb(attendanceData);
};

const allAttendanceFromDb = async (id) => {
  const url = `/all-attendance-classroom/${id}`;
  try {
    const { data, msg, err } = await getRequest(url);
    if (err) return;
    if (data) return { data, msg };
  } catch (e) {
    console.log(e);
  }
};

const attendanceBtn = () => {
  return `
    <button class='button' id="attendance_class">Attendance CLass</button>
  `;
};

const listTeacherToDom = () => {
  if (teacher_data.length > 1) teacher_data.shift();
  const data = teacher_data[0];

  for (let i = 0; data.length > i; i++) {
    const color = randDarkColor();

    document
      .querySelector('.class_list')
      .insertAdjacentHTML('beforeend', domClassList(data[i]));

    const room = document.getElementById(`room_${data[i]._id}`);
    room.style.backgroundColor = color;
    room.addEventListener('click', loadClassHandler);
  }
};

// Class List
const getClassroomHandler = async () => {
  loaderHandler();
  const url = '/get_classroom';
  try {
    const { data, msg, err } = await getRequest(url);
    if (err) errorDom(err);
    if (msg) {
      resetClassList();
      noListDom(msg);
    }
    if (data) {
      teacher_data.push(data);
      listToDomHandler();
    }
  } catch (e) {
    console.log(e);
  } finally {
    loaderHandler();
  }
};

export {
  teacher_data,
  classListHandler,
  saveClassList,
  savedNewClassList,
  deleteClassList,
  deleteClassListHandler,
  getClassToken,
  onChangeLinkDropDown,
  copyLink,
  loadClassHandler,
  getClassroomHandler,
};
