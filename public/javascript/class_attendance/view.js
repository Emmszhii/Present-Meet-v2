const closeParentNode = (e) => {
  const dom = e.currentTarget.parentNode;
  console.log(dom);
  if (dom) dom.remove();
};

const noListDom = (msg) => {
  const dom = document.querySelector('.class_list');
  dom.insertAdjacentHTML('beforeend', `<p id="msg_class_list">${msg}</p>`);
};

const resetClassList = () => {
  const dom = document.querySelector('.class_list');
  if (dom.hasChildNodes) dom.innerHTML = ``;
};

const removeChildElement = () => {
  const dom = document.querySelector('.container_class');
  if (dom.hasChildNodes) dom.innerHTML = ``;
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
        <div class="link"></div>
        <div id="students_table"></div>
      </div>
    </div>
  `;
};

const linkDom = () => {
  return `
      <input class='un-capitalize' id="link_classroom" readonly>
      <select id="link_time"></select>
      <button class='button' id="copy"><i class="fa-solid fa-copy"></i></button>
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

const msgStudentTable = (msg) => {
  return `
    <div class='no_student'>
      <h3>${msg}</h3>
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

const errorMessage = () => {
  return `
    <div class="error_msg">
      <div class="errorMsg"></div>
      <button class='button error_btn'><span>&times;</span></button>
    </div>
  `;
};
const successMessage = () => {
  return `
    <div class="success_msg">
      <div class="successMsg"></div>
      <button class='button success_btn'><span>&times;</span></button>
    </div>
  `;
};
const warningMessage = () => {
  return `
    <div class="warning_msg">
      <div class="warningMsg"></div>
      <button class='button warning_btn'><span>&times;</span></button>
    </div>
  `;
};

export {
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
  errorMessage,
  successMessage,
  warningMessage,
};
