import { keyPressEmail, sendUserEmail } from './forgotPassword.js';

document
  .getElementById('email__submit')
  .addEventListener('click', sendUserEmail);

document.getElementById('email').addEventListener('keypress', keyPressEmail);
