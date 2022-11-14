import {
  recognizeHandler,
  startVideoHandler,
  photoHandler,
  fetchPrevDescriptor,
  informationHandler,
  onChangeCameraDevice,
} from './face_recognition.js';
import { loader } from './loader.js';
import { errorMsg } from './msg.js';

document
  .getElementById('camera-btn')
  .addEventListener('click', startVideoHandler);
document.getElementById('photo-btn').addEventListener('click', photoHandler);
document
  .getElementById('recognize-btn')
  .addEventListener('click', recognizeHandler);

// implement onchange camera device
document
  .getElementById('camera_device')
  .addEventListener('change', onChangeCameraDevice);

window.addEventListener('load', () => {
  // isHttps();
  // const http = isHttps();
  // if (!http) document.location.href = `/connection-secure`;

  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
    fetchPrevDescriptor(),
  ])
    .then(async () => {
      await informationHandler();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      loader();
    });
});
