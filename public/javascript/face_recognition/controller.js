import {
  recognizeHandler,
  startVideoHandler,
  photoHandler,
  fetchPrevDescriptor,
  informationHandler,
  onChangeCameraDevice,
} from './face_recognition.js';
import { loader } from './loader.js';

// open camera
document
  .getElementById('camera-btn')
  .addEventListener('click', startVideoHandler);
// take photo and descriptor of the user
document.getElementById('photo-btn').addEventListener('click', photoHandler);
// recognize user
document
  .getElementById('recognize-btn')
  .addEventListener('click', recognizeHandler);
// implement onchange camera device
document
  .getElementById('camera_device')
  .addEventListener('change', onChangeCameraDevice);

window.addEventListener('load', () => {
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
