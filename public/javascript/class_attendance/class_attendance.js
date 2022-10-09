import { postRequest, getRequest, randDarkColor } from '../helpers/helpers.js';

const teacher_data = [];
let num = 1;
const addingUser = [];

const classListHandler = () => {
  const list = document.getElementById('add_list');
  if (list) {
    list.remove();
    num = 1;
    addingUser.length = 0;
  } else {
    document
      .querySelector('.add_class')
      .insertAdjacentHTML('beforeend', domAddClassList());

    document
      .getElementById(`add_list_btn`)
      .addEventListener('click', addClassList);

    document
      .getElementById('add_user_btn')
      .addEventListener('click', addUserHandler);
  }
};

const addUserHandler = () => {
  addingUser.length = 0;

  let index = num++;
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
        parent.appendChild(sort[i]);
      }
    }
  }

  console.log(numArr[0]);

  document
    .querySelector('.users')
    .insertAdjacentHTML('beforeend', createInput(numArr[0]));

  document
    .getElementById(`remove_${numArr[0]}`)
    .addEventListener('click', (e) => {
      const target = e.currentTarget;
      const parentNode = target.parentNode;
      const dom = parentNode;
      if (dom) {
        num--;
        dom.remove();
      }
    });

  console.log();
  numArr.length = 0;
};

const addClassList = () => {
  addingUser.length = 0;
  const subject = document.getElementById(`subject`);
  const section = document.getElementById(`section`);
  if (subject.value && section.value) {
    studentHandler();
    const data = {
      subject: subject.value,
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
    const lname = document.getElementById(`user_lastName_${i}`);
    // if (fname.value.length < 3 || lname.value.length < 3) return;
    addingUser.push({
      firstName: fname.value,
      lastName: lname.value,
    });
  }
};

const getClassroomHandler = async () => {
  teacher_data.length = 0;
  console.log(teacher_data);
  getRequest('/get_classroom')
    .then((data) => {
      console.log(data);
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

const listToDom = () => {
  const data = teacher_data[0];
  console.log(data);

  for (let i = 0; data.length > i; i++) {
    const color = randDarkColor();
    document
      .querySelector('.class_list')
      .insertAdjacentHTML(
        'beforeend',
        domClassList(data[i]._id, data[i].subject, data[i].section)
      );
    document.getElementById(`room_${data[i]._id}`).style.backgroundColor =
      color;
  }
};

const domClassList = (list_id, subject, section) => {
  return `
    <div class="card" id="room_${list_id}">
      <div class="content">
        <div id="msg_content"></div>
        <div class="list_content" >
          <h5 id="list_id">Class ID: ${list_id}</h5>
          <h5 id="class_subject">Subject: ${subject}</h5>
          <h5 id="class_section">Section: ${section}</h5>
        </div>
      </div>
    </div>
  `;
};

const createInput = (num) => {
  return `
    <div id="user_${num}">
      <label>${num}</label>
      <input id="user_firstName_${num}" placeholder="First Name" min="3" autocomplete="off" required> 
      <input id="user_lastName_${num}" placeholder="Last Name" min="3" autocomplete="off" required>
      <button type="button" id="remove_${num}">
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
          <label for="subject">Subject</label>
          <input type="text" name="subject" id="subject" autocomplete="off" required>
          <label for="section">Section</label>
          <input type="text" name="section" id="section" autocomplete="off" required>
          <button type='button' class="button" id="add_user_btn">Add a User </button>
          <button type='button' class="button" id="add_list_btn">Save</button>
        </div>
        <div class="users">
        </div>
      </div>
    </div>
  `;
};

// addClassListBtn.addEventListener('click', classListHandler);
export { classListHandler, getClassroomHandler };
