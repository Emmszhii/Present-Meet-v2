import {
  recognizeHandler,
  startVideoHandler,
  photoHandler,
  onChangeCameraDevice,
  init,
} from './face_recognition.js';

document
  .getElementById('camera-btn')
  .addEventListener('click', startVideoHandler); // open camera

document.getElementById('photo-btn').addEventListener('click', photoHandler); // take photo and descriptor of the user

document
  .getElementById('recognize-btn')
  .addEventListener('click', recognizeHandler); // recognize user

document
  .getElementById('camera_device')
  .addEventListener('change', onChangeCameraDevice); // implement onchange camera device

document.addEventListener('DOMContentLoaded', init); // Initialize app
