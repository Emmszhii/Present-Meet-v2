import { getRequest } from '../helpers/helpers.js';

const joinBtn = document.getElementById('join');

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const classId = urlParams.get('id');
const token = urlParams.get('token');

const joinClass = async () => {
  const url = `/join/${classId}/${token}`;
  const { msg, err } = await getRequest(url);
  if (msg) {
    successJoinHandler();
  }
  if (err) {
    console.log(err);
    failedJoinHandler(err);
  }
};

const successJoinHandler = () => {
  const oldDom = document.querySelector('.content');
  if (oldDom) oldDom.innerHTML = ``;
  oldDom.insertAdjacentHTML('beforeend', successDom());
};

const successDom = () => {
  return `
  <div class="content_message">
    <h2 id="msg">You've successfully joined the class list</h2>
  </div>
  <button class='button' onclick="location.href='/'">Home</button>
  `;
};

const failedJoinHandler = (err) => {
  const oldDom = document.querySelector('.content');
  if (oldDom) oldDom.innerHTML = ``;
  oldDom.insertAdjacentHTML('beforeend', failedDom(err));
};

const failedDom = (err) => {
  return `
  <div class="content_message">
    <h3 id="msg">${err}</h3>
  </div>
  <button class='button' onclick="location.href='/'">Home</button>
  `;
};

window.addEventListener('load', () => {
  if (joinBtn) joinBtn.addEventListener('click', joinClass);
});
