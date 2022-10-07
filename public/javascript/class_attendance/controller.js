import { classListHandler, getClassroomHandler } from './class_attendance.js';

document
  .getElementById('add_class_list')
  .addEventListener('click', classListHandler);

window.addEventListener('load', () => {
  getClassroomHandler();
});
