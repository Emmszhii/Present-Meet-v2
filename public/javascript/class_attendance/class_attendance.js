import { postRequest, getRequest, randDarkColor } from '../helpers/helpers.js';

const teacher_data = [];

// Class List
const getClassroomHandler = async () => {
  loaderHandler();
  const url = '/get_classroom';
  getRequest(url)
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
    })
    .finally(() => {
      loaderHandler();
    });
};

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

const savedNewClassList = () => {
  loaderHandler();
  const subject = document.getElementById('subject').value;
  const year_level = document.getElementById('year_level').value;
  const section = document.getElementById('section').value;

  const password = document.getElementById('password').value;
  const data = {
    subject,
    year_level,
    section,
    password,
  };
  const url = '/add-class-list';
  postRequest(url, data)
    .then((data) => {
      if (data.data) {
        teacher_data.push(data.data);
        listToDomHandler();
        removeChildElement();
      }
      if (data.err) {
        console.log(data.err);
      }
    })
    .catch((e) => {
      console.log(e);
    })
    .finally(() => {
      removedOnConfirm();
      loaderHandler();
    });
};

const closeParentNode = (e) => {
  const dom = e.currentTarget.parentNode;
  if (dom) dom.remove();
};

const noListDom = (msg) => {
  const dom = document.querySelector('.class_list');
  dom.insertAdjacentHTML('beforeend', `<p id="msg_class_list">${msg}</p>`);
};

const listToDomHandler = () => {
  resetClassList();
  if (teacher_data.length > 1) teacher_data.shift();
  const data = teacher_data[0];

  for (let i = 0; data.length > i; i++) {
    const color = randDarkColor();

    document
      .querySelector('.class_list')
      .insertAdjacentHTML('beforeend', domClassList(data[i]));

    const room = document.getElementById(`room_${data[i]._id}`);
    room.style.backgroundColor = color;
    room.addEventListener('click', getClassHandler);
  }
};

const resetClassList = () => {
  const dom = document.querySelector('.class_list');
  if (dom.hasChildNodes) dom.innerHTML = ``;
};

const removeChildElement = () => {
  const dom = document.querySelector('.container_class');
  if (dom.hasChildNodes) dom.innerHTML = ``;
};

const getClassHandler = (e) => {
  const id = e.currentTarget.dataset.value;
  removeChildElement();

  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', getClassDom());

  document.querySelector('.close').addEventListener('click', closeParentNode);

  // class info
  const data = searchDataInArr(id);

  document.getElementById('main_list').dataset.value = data._id;
  document.getElementById('class_id').textContent = `Class ID: ${data._id}`;
  document.getElementById('subject').textContent = `Subject: ${data.subject}`;
  document.getElementById(
    'year_level'
  ).textContent = `Year Level: ${data.year_level}`;
  document.getElementById('section').textContent = `Section: ${data.section}`;

  document
    .getElementById('edit_class')
    .addEventListener('click', editClassHandler);
  document
    .getElementById('remove_class')
    .addEventListener('click', deleteClassListHandler);
};

const getClassDom = () => {
  return `
    <div class="card" id="main_list" data-value="">
      <button class="button close">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="content">
        <div id="class_info">
          <h5 id="class_id"></h5>
          <h5 id="subject"></h5>
          <h5 id="year_level"></h5>
          <h5 id="section"></h5>
        </div>
        <div class="settings">
          <button class='button' id="edit_class">Edit Class</button>
          <button class='button' id="remove_class">Remove Class</button>
        </div>
        <div id="students_table"></div>
      </div>
    </div>
  `;
};

const editClassHandler = () => {
  const id = document.getElementById('main_list').dataset.value;

  removeChildElement();

  document
    .querySelector('.container_class')
    .insertAdjacentHTML('beforeend', domAddClassList());

  const data = searchDataInArr(id);

  document.querySelector('.close').addEventListener('click', closeParentNode);

  document.getElementById('add_list').dataset.value = id;

  document.getElementById('class_text').textContent = `Edit a CLass List`;
  document.getElementById('subject').value = data.subject;
  document.getElementById('year_level').value = data.year_level;
  document.getElementById('section').value = data.section;

  document
    .getElementById('save_class_btn')
    .addEventListener('click', classSaved);
};

const classSaved = () => {
  loaderHandler();
  const subject = document.getElementById('subject').value;
  const year_level = document.getElementById('year_level').value;
  const section = document.getElementById('section').value;
  const id = document.getElementById('add_list').dataset.value;

  console.log(id, subject, year_level, section);

  const url = `/update-class`;
  postRequest(url, { id, subject, year_level, section })
    .then((data) => {
      if (data.data) {
        teacher_data.push(data.data);
        listToDomHandler();
        removeChildElement();
      } else {
        console.log(data);
      }
    })
    .catch((e) => {
      console.log(e);
    })
    .finally(() => {
      removedOnConfirm();
      loaderHandler();
    });
};

const searchDataInArr = (id) => {
  const data = teacher_data[0];
  for (let i = 0; data.length > i; i++) {
    if (id === data[i]._id) {
      return data[i];
    }
  }
  return;
};

const domMainClass = (data) => {
  const { _id, subject, year_level, section } = data;

  return `
    <div class="card" id="main_class">
      <div id="message_main">
        <p id="class_id" data-id="${_id}">Class ID: ${_id}</p>
      </div>
      <div class="form-group">
        <label for="subject">Subject : </label>
        <input type="text" name="subject" id="subject" value="${subject}" autocomplete="off" required/>

        <label for="year_level">Year level : </label>
        <input type="text" name="year_level" id="year_level" value="${year_level}" autocomplete="off" required/>

        <label for="section">Section : </label>
        <input type="text" name="section" id="section" value="${section}" autocomplete="off" required/>
      </div>

      <div class='container_group'>
        <div class="group_buttons">
          <div class="container_buttons">
            // <button type='button' class="button" id="add_user_btn">Add a User </button>
            <button type='button' class="button" id="update_list_btn">Update</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const domClassList = (data) => {
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

const domAddClassList = () => {
  return `
    <div class="card" id="add_list">
      <button class='button close'>&times;</button>
      <div class='content'>
        <div id="message_content">
          <p id="class_text">Add a Class List</p>
        </div>

        <div class='add_content'>
          <div class='form-group'>
            <label for="subject">Subject: </label>
            <input type="text" name="subject" id="subject" autocomplete="off" required>
          </div>
          <div class='form-group'>
          <label for="year">Year level: </label>
          <input type="text" name="year" id="year_level" autocomplete="off" required>
          </div>
          <div class='form-group'>
            <label for="section">Section: </label>
            <input type="text" name="section" id="section" autocomplete="off" required>
          </div>
        </div>

        <div class="group_buttons">
          <button type='button' class="button" id="save_class_btn">Save</button>
        </div>

        </div>
      </div>
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
          <th class="no_border"></th>
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
  students = data;
  for (let i = 0; n > i; i++) {
    document.getElementById(`edit_${i}`).addEventListener('click', editStudent);

    document
      .getElementById(`delete_${i}`)
      .addEventListener('click', deleteStudent);
  }
};

const onConfirm = () => {
  return `
    <div class="overlay"></div>
    <div class="modal">
      <div class="card">
        <div class="content">
          <div class='form-group'>
            <label for='password'>Password</label>
            <input name="password" type="password" id="password" autocomplete="off" required />
          </div>
          <div class="buttons">
            <button class='button' id="cancel">Cancel</button>
            <button class='button' id="confirm">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const removedOnConfirm = () => {
  const overlay = document.querySelector('.overlay');
  const modal = document.querySelector('.modal');
  if (overlay) overlay.remove();
  if (modal) modal.remove();
};

const loaderHandler = () => {
  const dom = document.getElementById('preloader');
  if (!dom) {
    document.body.insertAdjacentHTML('afterbegin', loaderDom());
  } else {
    dom.remove();
  }
};

const loaderDom = () => {
  return `
  <div id="preloader">
  </div>
`;
};

const deleteClassListHandler = () => {
  document.body.insertAdjacentHTML('beforeend', onConfirm());

  document.getElementById('cancel').addEventListener('click', removedOnConfirm);

  document.getElementById('confirm').addEventListener('click', deleteClassList);
};

const deleteClassList = () => {
  loaderHandler();
  const id = document.getElementById('main_list').dataset.value;
  const password = document.getElementById('password').value;
  const url = `/delete-class-list`;
  postRequest(url, { id, password })
    .then((data) => {
      if (data.data) {
        const classroom = data.data;
        teacher_data.push(classroom);
        listToDomHandler();
      } else {
        console.log(data);
      }
    })
    .catch((e) => console.log(e))
    .finally(() => {
      removedOnConfirm();
      loaderHandler();
    });
};

export { classListHandler, getClassroomHandler };
