import { successMessage, errorMessage, warningMessage } from './view.js';
import { closeParentNode } from './view.js';

const container = document.querySelector('.container');

const successDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.success_msg');
  let domText = document.querySelector('.successMsg');

  if (!addDom) {
    container.insertAdjacentHTML('beforeend', successMessage());
    domText = document.querySelector('.successMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.success_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const warningDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.warning_msg');
  let domText = document.querySelector('.warningMsg');

  if (!addDom) {
    container.insertAdjacentHTML('beforeend', warningMessage());
    domText = document.querySelector('.warningMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.warning_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const errorDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.error_msg');
  let domText = document.querySelector('.errorMsg');
  if (!addDom) {
    container.insertAdjacentHTML('beforeend', errorMessage());
    domText = document.querySelector('.errorMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.error_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const deleteMsg = () => {
  const errDom = document.querySelector('.error_msg');
  const warnDom = document.querySelector('.warning_msg');
  const successDom = document.querySelector('.success_msg');

  if (errDom) errDom.remove();
  if (warnDom) warnDom.remove();
  if (successDom) successDom.remove();
};

export { successDom, warningDom, errorDom, deleteMsg };
