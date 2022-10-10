import { postRequest, getRequest, randDarkColor } from '../helpers/helpers.js';

const teacher_data = [];
let num = 1;
const addingUser = [];

const classListHandler = () => {
  const list = document.getElementById('add_list');
  const containerListEl = document.getElementById('main_class');
  if (containerListEl) containerListEl.remove();
  if (list) {
    list.remove();
    num = 1;
    addingUser.length = 0;
    return;
  }
  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', domAddClassList());

  document
    .getElementById(`add_list_btn`)
    .addEventListener('click', addClassList);

  document
    .getElementById('add_user_btn')
    .addEventListener('click', addUserHandler);
};

const addUserHandler = () => {
  addingUser.length = 0;

  // let index = num++;
  num++;
  let sort = document.querySelector(`.users`).children;
  const numArr = [];

  for (let i = 1; num > i; i++) {
    // get dom if dom is false then run
    const dom = document.getElementById(`user_${i}`);
    if (!dom) {
      console.log(dom, i);
      numArr.push(i);
      sort = Array.prototype.slice.call(sort, 0);
      sort.sort(function (a, b) {
        const aord = +a.id.split('_')[1];
        const bord = +b.id.split('_')[1];
        return aord - bord;
      });
      const parent = document.querySelector('.users');
      parent.innerHTML = '';

      for (let i = 0, l = sort.length; i < l; i++) {
        console.log(i, l);
        parent.appendChild(sort[i]);
      }
    }
  }

  if (!numArr[0]) numArr[0] = num;
  console.log(numArr[0], num);

  document
    .querySelector('.users')
    .insertAdjacentHTML('beforeend', createInput(numArr[0]));

  document
    .getElementById(`remove_${numArr[0]}`)
    .addEventListener('click', removeStudent);

  console.log(numArr);
  numArr.length = 0;
};

const removeStudent = (e) => {
  const target = e.currentTarget;
  const parentNode = target.parentNode;
  const dom = parentNode;
  console.log(dom);
  if (dom) {
    num--;
    dom.remove();
  }
};

const addClassList = () => {
  addingUser.length = 0;
  const subject = document.getElementById(`subject`);
  const section = document.getElementById(`section`);
  const year = document.getElementById('year_level');
  if (subject.value && section.value) {
    studentHandler();
    const data = {
      subject: subject.value,
      year_level: year.value,
      section: section.value,
      students: addingUser,
    };

    postRequest('/add_list', data).then((res) => {
      const list = document.getElementById('add_list');
      const dom_list = document.querySelector('.class_list');
      if (res.msg) {
        num = 1;
        addingUser.length = 0;
        if (list) list.remove();
        if (dom_list) dom_list.innerHTML = ``;
        getClassroomHandler();
      }
      if (res.err) {
        console.log(res);
      }
    });
  }
};

const studentHandler = () => {
  for (let i = 1; num > i; i++) {
    const fname = document.getElementById(`user_firstName_${i}`);
    const mname = document.getElementById(`user_middleName_${i}`);
    const lname = document.getElementById(`user_lastName_${i}`);
    addingUser.push({
      firstName: fname.value,
      middleName: mname.value,
      lastName: lname.value,
    });
  }
};

const getClassroomHandler = async () => {
  teacher_data.length = 0;
  console.log(teacher_data);
  getRequest('/get_classroom')
    .then((data) => {
      if (data.msg) return noListDom(data.msg);

      if (data.data) {
        teacher_data.push(data.data);
        listToDom();
      } else {
        console.log(data);
      }
    })
    .catch((e) => {
      console.log(e);
    });
};

const noListDom = (msg) => {
  const dom = document.querySelector('.class_list');
  dom.insertAdjacentHTML('beforeend', `<p id="msg_class_list">${msg}</p>`);
};

const listToDom = () => {
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
  console.log(num);
  console.log(data.students);
  domEl.insertAdjacentHTML('beforeend', domMainClass(data));
  domEl.insertAdjacentHTML('beforeend', studentsDom(data.students));

  document
    .getElementById('add_user_btn')
    .addEventListener('click', addUserHandler);
};

const domMainClass = (data) => {
  const { subject, year_level, section } = data;
  console.log(year_level);

  return `
    <div class="card" id="main_class">
      <div class="form-group">
        <label for="subject">Subject : </label>
        <input type="text" name="subject" id="subject" value="${subject}" autocomplete="off" required>

        <label for="year_level">Year level : </label>
        <input type="text" name="year_level" id="year_level" value="${year_level}" autocomplete="off" required>

        <label for="section">Section : </label>
        <input type="text" name="section" id="section" value="${section}"autocomplete="off" required>
          
      </div>
      <div class='container_group'>
        <div class='users' id="student_list"></div>
        <div class="group_buttons">
          <div class="container_buttons">
            <button type='button' class="button" id="add_user_btn">Add a User </button>
            <button type='button' class="button" id="update_list_btn">Update</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const studentsDom = (students) => {
  for (let i = 0; students.length > i; i++) {
    document
      .getElementById('student_list')
      .insertAdjacentHTML('beforeend', createInput(i + 1));

    document.getElementById(`user_firstName_${i + 1}`).value =
      students[i].firstName;

    document.getElementById(`user_middleName_${i + 1}`).value =
      students[i].middleName;

    document.getElementById(`user_lastName_${i + 1}`).value =
      students[i].lastName;

    document
      .getElementById(`remove_${i + 1}`)
      .addEventListener('click', removeStudent);
  }
  return ``;
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

const createInput = (num) => {
  return `
    <div class="user" id="user_${num}">
      <label>${num}</label>
      <input id="user_firstName_${num}" placeholder="First Name" min="3" autocomplete="off" required> 
      <input id="user_middleName_${num}" placeholder="Middle Name" min="3" autocomplete="off" required> 
      <input id="user_lastName_${num}" placeholder="Last Name" min="3" autocomplete="off" required>
      <button class="close" type="button" id="remove_${num}">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
};

const domAddClassList = () => {
  return `
    <div class="card" id="add_list">
      <div class='content'>
        <div id="message_content">
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
          <div class="users"></div>
          <div class="group_buttons">
            <div class="container_buttons">
              <button type='button' class="button" id="add_user_btn">Add a User </button>
              <button type='button' class="button" id="add_list_btn">Save</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `;
};

export { classListHandler, getClassroomHandler };
