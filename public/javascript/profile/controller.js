import {
  updateUser,
  updatePassword,
  openModal,
  closeModal,
  openModalChangePw,
  closeModalChangePw,
} from './profile.js';

// event listeners
// modals
document.getElementById('submit-btn').addEventListener('click', openModal);
document.getElementById('cancel').addEventListener('click', closeModal);
document
  .getElementById('change-pw')
  .addEventListener('click', openModalChangePw);
document
  .getElementById('cancel_change_pw')
  .addEventListener('click', closeModalChangePw);
// update info
document.getElementById('confirm').addEventListener('click', updateUser);
// change password
document
  .getElementById('change_pw_btn')
  .addEventListener('click', updatePassword);
