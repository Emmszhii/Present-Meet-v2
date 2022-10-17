import { getRequest, postRequest, randDarkColor } from '../helpers/helpers.js';
import { successDom, warningDom, errorDom, deleteMsg } from './helper.js';
import {
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
} from './classroom.js';
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

const students_data = [];

const fetchStudents = async (id) => {
  const url = `/get_students/${id}`;
  const data = await getRequest(url);
  return data;
};

const listStudentToDom = async (id) => {
  const { data, msg } = await fetchStudents(id);
  if (data) students_data.push(data);

  if (students_data.length > 1) students_data.shift();

  const domStudents = document.getElementById('students_table');

  if (msg) {
    const dom = document.querySelector('no_student');
    if (!dom) domStudents.insertAdjacentHTML('beforeend', msgStudentTable(msg));
  }

  if (data) {
    domStudents.insertAdjacentHTML('beforeend', addTable());
    studentTableData(students_data);
  }
};

const studentTableData = (data) => {
  const tableBody = document.getElementById('tableData');
  let dataHtml = ``;
  let n = 0;
  const copyData = data[0];
  console.log(copyData);
  for (const [index, student] of copyData.entries()) {
    n++;
    dataHtml += `
    <tr>
      <td>${student.first_name}</td>
      <td>${student.middle_name}</td>
      <td>${student.last_name}</td>
      <td class="no_border">
      <button class='button' id="delete_${index}" value="${student._id}">
        <i class='fa-solid fa-x'>
        </i>
      </button>
      </td>
    </tr>
    `;
  }
  tableBody.innerHTML = dataHtml;
  // students_data = data;
  for (let i = 0; n > i; i++) {
    document
      .getElementById(`delete_${i}`)
      .addEventListener('click', deleteStudentHandler);
  }
};

const deleteStudentHandler = async (e) => {
  const id = e.currentTarget.value;

  document.body.insertAdjacentHTML('beforeend', onConfirm());

  document.getElementById('cancel').addEventListener('click', removedOnConfirm);

  document.getElementById('confirm').value = id;
  document.getElementById('confirm').addEventListener('click', deleteStudent);
};

const deleteStudent = async (e) => {
  loaderHandler();
  const id = e.currentTarget.value;
  const password = document.getElementById('password').value;
  const url = `/delete-student`;

  try {
    const { msg, err } = await postRequest(url, { id, password });
    if (msg) {
      successDom(msg);
      getClassroomHandler();
      listStudentToDom();
      removeChildElement();
    }
    if (err) errorDom(err);
  } catch (e) {
    console.log(e);
    errorDom(e);
  } finally {
    loaderHandler();
    removedOnConfirm();
  }
};

const searchStudentDataInArr = (id) => {
  const data = students_data[0];
  for (const [index, value] of data) {
    console.log(index, value);
    if (id === value._id) {
      console.log(`found`);
      return value;
    }
  }
};

export { students_data, fetchStudents, listStudentToDom, studentTableData };
