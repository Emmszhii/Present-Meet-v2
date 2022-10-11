import { postRequest, getRequest, randDarkColor } from '../helpers/helpers.js';

const teacher_data = [];
let num = 1;
const users = [];
let students;

const getClassroomHandler = async () => {
  teacher_data.length = 0;
  console.log(teacher_data);
  getRequest('/get_classroom')
    .then((data) => {
      if (data.msg) return noListDom(data.msg);

      if (data.data) {
        teacher_data.push(data.data);
        listToDomHandler();
      } else {
        console.log(data);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

const classListHandler = () => {
  const list = document.getElementById('add_list');
  const addUserDom = document.getElementById('add_user');
  const containerListEl = document.getElementById('main_class');
  if (containerListEl) containerListEl.remove();
  if (addUserDom) addUserDom.remove();
  if (list) {
    list.remove();
    num = 1;
    users.length = 0;
    return;
  }

  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', domAddClassList());

  document
    .getElementById(`save_list_btn`)
    .addEventListener('click', saveClassList);

  document.getElementById('table').insertAdjacentHTML('beforeend', addTable());

  document
    .getElementById('add_user_btn')
    .addEventListener('click', addUserHandler);
};

const addUserHandler = (event) => {
  const userDom = document.getElementById(`add_user`);
  const userContent = document.getElementById('add_user_content');
  const btn = event.currentTarget;

  if (!userContent) {
    userDom.insertAdjacentHTML('afterbegin', createInput());
    btn.textContent = 'Close';
  } else {
    userContent.remove();
    btn.textContent = 'Add Student';
  }

  const add_student_btn = document.getElementById('add_student');
  if (add_student_btn) {
    add_student_btn.addEventListener('click', addStudent);
    document.querySelector('.close').addEventListener('click', closeParentNode);
  }
};

const closeParentNode = (e) => {
  const dom = e.currentTarget.parentNode;
  const addStudentBtn = document.getElementById('add_user_btn');
  if (addStudentBtn) addStudentBtn.textContent = `Add Student`;
  if (dom) dom.remove();
};

const addStudent = async (event) => {
  const parentDom = event.currentTarget.parentNode;
  const primaryBtn = document.getElementById('add_user_btn');
  const first_name = document.getElementById('first_name');
  const middle_name = document.getElementById('middle_name');
  const last_name = document.getElementById('last_name');

  const input = {
    first_name: first_name.value,
    middle_name: middle_name.value,
    last_name: last_name.value,
  };

  postRequest('/add-student', input).then((data) => {
    if (data.students) {
      parentDom.remove();
      primaryBtn.textContent = 'Add Student';
      students = data.students;
      studentTableData(students);
    }
  });
};

const editStudent = (e) => {
  const btn = e.currentTarget;
  let first_name, middle_name, last_name;
  let n;
  const dom = document.getElementById('add_user_content');

  if (!dom) {
    document
      .getElementById('add_user')
      .insertAdjacentHTML('afterbegin', createInput());

    document.querySelector('.close').addEventListener('click', closeParentNode);
  }

  for (const [index, val] of students.entries()) {
    const num = +btn.value;
    if (num === index) {
      first_name = val.first_name;
      middle_name = val.middle_name;
      last_name = val.last_name;
      n = index;
    }
  }

  document.getElementById('first_name').value = first_name;
  document.getElementById('middle_name').value = middle_name;
  document.getElementById('last_name').value = last_name;

  const updateBtn = document.getElementById('add_student');
  updateBtn.textContent = 'Update User';
  updateBtn.value = n;

  updateBtn.addEventListener('click', updateStudentArr);
};

const updateStudentArr = (e) => {
  const first_name = document.getElementById('first_name');
  const middle_name = document.getElementById('middle_name');
  const last_name = document.getElementById('last_name');

  const value = e.currentTarget.value;

  const data = {
    first_name: first_name.value,
    middle_name: middle_name.value,
    last_name: last_name.value,
    value,
  };

  postRequest('/update-student', data)
    .then((data) => {
      console.log(data.msg);
      console.log(data.students);
      if (!data.msg || !data.students) return;
      students = data.students;
      studentTableData(students);
    })
    .catch((e) => {
      console.log(e);
    });
};

const saveClassList = () => {
  users.length = 0;
  const subject = document.getElementById(`subject`);
  const section = document.getElementById(`section`);
  const year = document.getElementById('year_level');

  // studentHandler();
  const data = {
    subject: subject.value,
    year_level: year.value,
    section: section.value,
  };

  postRequest('/add_list', data).then((res) => {
    const list = document.getElementById('add_list');
    const addUserDom = document.getElementById('add_user');
    const dom_list = document.querySelector('.class_list');
    if (res.msg) {
      num = 1;
      if (list) list.remove();
      if (addUserDom) addUserDom.remove();
      if (dom_list) dom_list.innerHTML = ``;
      getClassroomHandler();
    }
    if (res.err) {
      console.log(res);
    }
  });
};

const noListDom = (msg) => {
  const dom = document.querySelector('.class_list');
  dom.insertAdjacentHTML('beforeend', `<p id="msg_class_list">${msg}</p>`);
};

const listToDomHandler = () => {
  const data = teacher_data[0];
  console.log(data);

  for (let i = 0; data.length > i; i++) {
    const color = randDarkColor();

    document
      .querySelector('.class_list')
      .insertAdjacentHTML('beforeend', domClassList(data[i]));

    const room = document.getElementById(`room_${data[i]._id}`);
    room.style.backgroundColor = color;
    room.addEventListener('click', getStudentsHandler);
  }
};

const getStudentsHandler = async (e) => {
  const domEl = document.querySelector('.container_class');
  if (domEl) domEl.innerHTML = ``;
  const value = e.currentTarget.dataset.value;
  const add_list = document.getElementById('add_list');
  if (add_list) add_list.remove();

  const data = await getRequest(`/get_students/${value}`);
  num = data.students.length;
  // console.log(num);
  // console.log(data.students);
  domEl.insertAdjacentHTML('beforeend', domMainClass(data));

  const tableDom = document.getElementById('table');
  if (tableDom) {
    tableDom.insertAdjacentHTML('beforeend', addTable());
    studentTableData(data.students);
  }

  // domEl.insertAdjacentHTML('beforeend', studentsDom(data.students));

  document
    .getElementById('add_user_btn')
    .addEventListener('click', addUserHandler);

  // document
  //   .getElementById('update_list_btn')
  //   .addEventListener('click', updateListHandler);
};

const domMainClass = (data) => {
  const { _id, subject, year_level, section } = data;

  return `
    <div class="card" id="main_class">
      <div id="message_main">
        <p id="main_msg">Class ID: ${_id}</p>
      </div>
      <div class="form-group">
        <label for="subject">Subject : </label>
        <input type="text" name="subject" id="subject" value="${subject}" autocomplete="off" required>

        <label for="year_level">Year level : </label>
        <input type="text" name="year_level" id="year_level" value="${year_level}" autocomplete="off" required>

        <label for="section">Section : </label>
        <input type="text" name="section" id="section" value="${section}"autocomplete="off" required>
          
      </div>
      <div class='container_group'>
        <div class='users' id="table"></div>
        <div class="group_buttons">
          <div class="container_buttons">
            <button type='button' class="button" id="add_user_btn">Add a User </button>
            <button type='button' class="button" id="update_list_btn">Update</button>
          </div>
        </div>
      </div>
    </div>
    <div id="add_user"></div>
  `;
};

const domClassList = (data) => {
  console.log(data);
  const { _id, subject, year_level, section } = data;
  return `
    <div class="card card__clickable" id="room_${_id}" data-value="${_id}">
      <div class="content">
        <div class="list_content">
          <h5 id="list_id"">Class ID : ${_id}</h5>
          <h5 id="class_subject">Subject : ${subject}</h5>
          <h5 id="class_year_level">Year Level : ${year_level}</h5>
          <h5 id="class_section">Section : ${section}</h5>
        </div>
      </div>
    </div>
  `;
};

const createInput = () => {
  return `
    <div class="card" id="add_user_content">
      <button class="close" type="button" id="remove">
        <span aria-hidden="true">&times;</span>
      </button>
        <div class='form-group'>
          <label for="firstName">First Name : </label>
          <input class='input' name="firstName" id="first_name" min="3" autocomplete="off" required> 
        </div>
        
        <div class='form-group input'>
          <label for="middleName">Middle Name : </label>
          <input class='input' name="middleName" id="middle_name" min="3" autocomplete="off" required> 
        </div>

        <div class='form-group input'>
          <label for="lastName">Last Name : </label>
          <input class='input' name="middleName" id="last_name" min="3" autocomplete="off" required>
        </div>

        <button class="button" id="add_student" type="button">Add Student</button>
    </div>
  `;
};

const domAddClassList = () => {
  return `
    <div class="card" id="add_list">
      <div class='content'>
        <div id="message_content">
          <p id="adding_class_text">Add a Class List</p>
        </div>
        <div class='add_content'>
          <label for="subject">Subject: </label>
          <input type="text" name="subject" id="subject" autocomplete="off" required>
          <label for="year">Year level: </label>
          <input type="text" name="year" id="year_level" autocomplete="off" required>
          <label for="section">Section: </label>
          <input type="text" name="section" id="section" autocomplete="off" required>
        </div>
        <div class='container_group'>
          <div class="users" id="table">
          
          </div>
          <div class="group_buttons">
            <div class="container_buttons">
              <button type='button' class="button" id="add_user_btn">Add Student</button>
              <button type='button' class="button" id="save_list_btn">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="add_user">
    </div>
  `;
};

const addTable = () => {
  return `
    <table>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Middle Name</th>
          <th>Last Name</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody id="tableData"></tbody>
    </table>
  `;
};

const studentTableData = (data) => {
  const tableBody = document.getElementById('tableData');
  let dataHtml = ``;
  let n = 0;

  for (const [index, student] of data.entries()) {
    console.log(index);
    n++;
    dataHtml += `
    <tr>
      <td>${student.first_name}</td>
      <td>${student.middle_name}</td>
      <td>${student.last_name}</td>
      <td>
      <button class='button' id="edit_${index}" value="${index}">
        <i class='fa-solid fa-pen-to-square'>
        </i>
      </button>
      </td>
    </tr>
    `;
  }
  tableBody.innerHTML = dataHtml;
  students = data;
  for (let i = 0; n > i; i++) {
    document.getElementById(`edit_${i}`).addEventListener('click', editStudent);
  }
};

export { classListHandler, getClassroomHandler };
