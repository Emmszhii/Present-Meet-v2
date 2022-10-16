import { getRequest } from '../helpers/helpers.js';

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const classId = urlParams.get('id');
const token = urlParams.get('token');

const joinClass = async () => {
  const url = `/join/${classId}/${token}`;
  const { msg, err } = await getRequest(url);
  if (msg) {
  }
};

const successJoinHandler = () => {
  const oldDom = document.querySelector('.invitation_link');
  if (oldDom) oldDom.remove();
  document.body.insertAdjacentHTML('afterbegin');
};

const successDom = () => {
  return `
    <div class="card invitation_link">
      <div>
      </div>
    </div>
  `;
};

const failedJoinHandler = () => {};

document.getElementById('join').addEventListener('click', joinClass);
