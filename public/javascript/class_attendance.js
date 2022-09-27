const addClassListBtn = document.getElementById('add_class_list');
let num = 1;
const addingUser = [];

const classListHandler = () => {
  const list = document.getElementById('add_list');
  if (list) {
    list.remove();
    num = 0;
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

  for (let i = 1; num > i; i++) {
    // get dom if dom is false then run
    const dom = document.getElementById(`user_${i}`);
    if (!dom) {
      index = i;
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

  document
    .querySelector('.users')
    .insertAdjacentHTML('beforeend', createInput(index));
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
      console.log(res);
      if (res) {
        num = 0;
        addingUser.length = 0;
        const list = document.getElementById('add_list');
        if (list) list.remove();
      }
    });
  }
};

const studentHandler = () => {
  for (let i = 1; num >= i; i++) {
    const fname = document.getElementById(`user_firstName_${i}`);
    const lname = document.getElementById(`user_lastName_${i}`);
    // if (fname.value.length < 3 || lname.value.length < 3) return;

    addingUser.push({
      firstName: fname.value,
      lastName: lname.value,
    });
  }
};

const deleteDom = (id) => {
  const dom = document.getElementById(`user_${id}`);
  if (dom) {
    dom.remove();
    num--;
  }
};

const postRequest = async (url, data) => {
  const resp = await fetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const res = await resp.json();
  if (resp.ok) {
    return res;
  } else {
    console.log(res);
  }
};

const createInput = (num) => {
  return `
    <div id="user_${num}">
      <label>${num}</label>
      <input id="user_firstName_${num}" placeholder="First Name" min="3" autocomplete="off" required> 
      <input id="user_lastName_${num}" placeholder="Last Name" min="3" autocomplete="off" required>
      <button type="button" onclick="deleteDom(${num})">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;
};

const domAddClassList = () => {
  return `
    <div class="card" id="add_list">
      <div class='content'>
        <div class='main_content'>
          <label for="subject">Subject</label>
          <input type="text" name="subject" id="subject">
          <label for="section">Section</label>
          <input type="text" name="section" id="section">
          <button type='button' class="button" id="add_user_btn">Add a User </button>
          <button type='button' class="button" id="add_list_btn">Save</button>
        </div>
        <div class="users">
        </div>
      </div>
    </div>
  `;
};

addClassListBtn.addEventListener('click', classListHandler);
