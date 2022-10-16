import { getRequest, postRequest, randDarkColor } from '../helpers/helpers.js';
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
  console.log(students_data);

  const domStudents = document.getElementById('students_table');
  if (msg) domStudents.insertAdjacentHTML('beforeend', msgStudentTable(msg));

  if (data) {
    domStudents.insertAdjacentHTML('beforeend', addTable());
    studentTableData(students_data);
  }
};

const studentTableData = (data) => {
  const tableBody = document.getElementById('tableData');
  let dataHtml = ``;
  let n = 0;

  for (const [index, student] of data.entries()) {
    console.log(index);
    console.log(student);
    n++;
    dataHtml += `
    <tr>
      <td>${student[index].first_name}</td>
      <td>${student[index].middle_name}</td>
      <td>${student[index].last_name}</td>
      <td class="no_border">
      <button class='button' id="edit_${index}" value="${index}">
        <i class='fa-solid fa-pen-to-square'>
        </i>
      </button>
      <button class='button' id="delete_${index}" value="${index}">
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
    document.getElementById(`edit_${i}`).addEventListener('click', editStudent);

    document
      .getElementById(`delete_${i}`)
      .addEventListener('click', deleteStudent);
  }
};

const editStudent = () => {
  console.log(`edit student`);
};
const deleteStudent = () => {
  console.log(`delete student`);
};

export { students_data, fetchStudents, listStudentToDom, studentTableData };
