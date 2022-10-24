import { postRequest } from '../helpers/helpers.js';

const loaderHandler = () => {
  const loader = document.getElementById('profile_loader');
  if (loader) loader.classList.toggle('svg_spinner');
};

const updateUser = async () => {
  loaderHandler();
  const firstName = document.getElementById('first_name').value;
  const middleName = document.getElementById('middle_name').value;
  const lastName = document.getElementById('last_name').value;
  const birthday = document.getElementById('birthday').value;
  const type = document.getElementById('user-type').value;
  const password = document.getElementById('password');
  const info = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    birthday,
    type,
    password: password.value,
  };
  try {
    const url = `/profile`;
    const { msg, err } = await postRequest(url, info);
    if (msg) msgHandler(msg);
    if (err) errorHandler(err);
  } catch (e) {
    console.log(e);
  } finally {
    password.value = '';
    closeModal();
    loaderHandler();
  }
};

const updatePassword = async () => {
  loaderHandler();
  const oldPw = document.getElementById('change_password');
  const newPw = document.getElementById('change_password1');
  const confirmPw = document.getElementById('change_password2');
  const password = {
    password: oldPw.value,
    newPassword: newPw.value,
    newPassword1: confirmPw.value,
  };
  try {
    const url = `/password`;
    const { msg, err } = await postRequest(url, password);
    if (msg) msgHandler(msg);
    if (err) errorHandler(err);
  } catch (e) {
    console.log(e);
  } finally {
    closeModalChangePw();
    loaderHandler();
  }
};

const errorHandler = (err) => {
  const msg = document.getElementById('msg');
  if (msg) {
    msg.remove();
  }
  const p = document.createElement('p');
  p.textContent = err;
  p.id = 'err';

  const errP = document.getElementById('err');
  if (errP) {
    errP.innerText = err;
  } else {
    document.getElementById('messages').appendChild(p);
  }
};

const msgHandler = (msg) => {
  const err = document.getElementById('err');
  if (err) {
    err.remove();
  }
  const p = document.createElement('p');
  p.textContent = msg;
  p.id = 'msg';

  const msgP = document.getElementById('msg');
  if (msgP) {
    msgP.innerText = msg;
  } else {
    document.getElementById('messages').appendChild(p);
  }
};

const openModal = () => {
  const modal = document.getElementById('modal-confirm');
  modal.style.display = 'block';
};

const closeModal = () => {
  const modal = document.getElementById('modal-confirm');
  document.getElementById('password').value = '';
  modal.style.display = 'none';
};

const openModalChangePw = () => {
  const modal = document.getElementById('modal-password');
  modal.style.display = 'block';
};

const closeModalChangePw = () => {
  const modal = document.getElementById('modal-password');
  modal.style.display = 'none';
  document.getElementById('change_password').value = '';
  document.getElementById('change_password1').value = '';
  document.getElementById('change_password2').value = '';
};

export {
  updateUser,
  updatePassword,
  errorHandler,
  msgHandler,
  openModal,
  closeModal,
  openModalChangePw,
  closeModalChangePw,
  loaderHandler,
};
