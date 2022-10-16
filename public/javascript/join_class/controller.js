import { getRequest } from '../helpers/helpers.js';

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const classId = urlParams.get('id');
const token = urlParams.get('token');

const joinClass = () => {
  const url = `/join/${classId}/${token}`;
  console.log(url);
  // getRequest(url);
};

document.getElementById('join').addEventListener('click', joinClass);
