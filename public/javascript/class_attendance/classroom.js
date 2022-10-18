import { getRequest, postRequest, randDarkColor } from '../helpers/helpers.js';
import { successDom, warningDom, errorDom, deleteMsg } from './helper.js';
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
    if (data) {
      successDom(msg);
      getClassroomHandler();
      removeChildElement();
    }
    if (err) {
      errorDom(err);
    }
  } catch (e) {
    console.log(e);
  } finally {
    removedOnConfirm();
  }
};

const getClassToken = async () => {
  const id = document.getElementById('main_list').dataset.value;
  const time = document.getElementById('link_time').value;
  const url = `/generate-class-token/${id}/${time}`;
  const token = getRequest(url);
  return token;
};

const onChangeLinkDropDown = async (e) => {
  const { token } = await getClassToken();

  const id = document.getElementById('main_list').dataset.value;
  const url = window.location.href;

  const link = `${url}/join/?id=${id}&token=${token}`;
  document.getElementById('link_classroom').value = link;
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

  const link = `${url}/join/?id=${id}&token=${token}`;

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

const loadClassHandler = async (e) => {
  const id = e.currentTarget.dataset.value;
  listStudentToDom(id);

  removeChildElement();

  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', getClassDom());

  document.querySelector('.close').addEventListener('click', closeParentNode);

  // class info
  const data = searchTeacherDataInArr(id);

  document.getElementById('main_list').dataset.value = data._id;
  document.getElementById('class_id').textContent = `Class ID: ${data._id}`;
  document.getElementById('subject').textContent = `Subject: ${data.subject}`;
  document.getElementById(
    'year_level'
  ).textContent = `Year Level: ${data.year_level}`;
  document.getElementById('section').textContent = `Section: ${data.section}`;

  studentDomHandler();

  document
    .getElementById('edit_class')
    .addEventListener('click', editClassHandler);
  document
    .getElementById('remove_class')
    .addEventListener('click', deleteClassListHandler);
};

const listToDomHandler = () => {
  resetClassList();
  listTeacherToDom();
};

const listTeacherToDom = () => {
  console.log(teacher_data);
  if (teacher_data.length > 1) teacher_data.shift();
  const data = teacher_data[0];
  console.log(data);
  console.log(data.length);
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
    if (msg) {
      resetClassList();
      noListDom(msg);
    }
    if (data) {
      teacher_data.push(data);
      console.log(teacher_data);
      listToDomHandler();
    }
    if (err) {
      errorDom(err);
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
