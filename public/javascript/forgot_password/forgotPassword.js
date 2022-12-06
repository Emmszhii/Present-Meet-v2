import { loader } from '../helpers/loader.js';
import { getRequest, postRequest } from '../helpers/helpers.js';
const dom = document.getElementById('forgot-div');

let token;

const sendUserEmail = async (e) => {
  loader();
  const emailValue = document.getElementById('email').value;
  const url = `/forgot-password`;
  const postData = { emailValue };
  try {
    const { data, err, msg } = await postRequest(url, postData);
    if (err) return console.log(err);
    if (data.token) {
      token = data.token;
      changeDivToOtp();
    }
  } catch (e) {
    console.log(e);
  } finally {
    loader();
  }
};

const changeDivToOtp = () => {
  dom.innerHTML = `
  <input type='text' name='code' id='code' autocomplete='off'>
  <label for='code'>Input the code sent to your email</label>
  <button type='button' id='code__submit' class='button'>Verify</button>
  `;

  document.getElementById('code').addEventListener('keydown', keypressOtp);
  document
    .getElementById('code__submit')
    .addEventListener('click', verifyHandler);
};

const changeDivToChangePassword = (email) => {
  dom.innerHTML = `
  <p>Changing password of ${email}</p>
  <input type='password' name='password' id='password' autocomplete='off'>
  <label for='password'>Password</label>
  <input type='password' name='confirm-password' id='confirm-password' autocomplete='off'>
  <label for='confirm-password'>Confirm Password</label>
  <button type='button' id='password__submit' class='button'>Submit</button>
  `;

  document
    .getElementById('password')
    .addEventListener('keydown', keyPressPassword);
  document
    .getElementById('confirm-password')
    .addEventListener('keydown', keyPressPassword);
  document
    .getElementById('password__submit')
    .addEventListener('click', changePassword);
};

const verifyHandler = async () => {
  const code = document.getElementById('code').value;
  try {
    const url = `/forgot-password/${code}/${token}`;
    const { data, err, msg } = await getRequest(url);
    if (err) return console.log(err);
    const { success, failed, email } = data;
    if (failed) return console.log(`invalid code`);
    if (success) changeDivToChangePassword(email);
  } catch (e) {
    console.log(e);
  }
};

const changePassword = async () => {
  const pw1 = document.getElementById('password').value;
  const pw2 = document.getElementById('confirm-password').value;
  try {
    const postData = { pw1, pw2, token };
    const url = `/forgot-password/change-password`;
    const { data, msg, err } = await postRequest(url, postData);
    const { success, failed } = data;
    if (err) return console.log(err);
    if (failed) return console.log(`something went wrong`);
    if (success) redirectToHome();
  } catch (e) {
    console.log(e);
  }
};

const redirectToHome = async () => {
  const url = `/redirect-to-home/change-password`;
  window.location.href = url;
};

const keyPressPassword = (e) => {
  const key = e.key;
  if (key === 'Enter') changePassword();
};

const keypressOtp = async (e) => {
  const key = e.key;
  if (key === 'Enter') verifyHandler();
};

const keyPressEmail = async (e) => {
  const key = e.key;
  if (key === 'Enter') sendUserEmail();
};

export { sendUserEmail, keyPressEmail };
