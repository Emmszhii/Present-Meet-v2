import { classListHandler, getClassroomHandler } from './classroom.js';

document
  .getElementById('add_class_list')
  .addEventListener('click', classListHandler);

window.addEventListener('load', () => {
  getClassroomHandler();
});
