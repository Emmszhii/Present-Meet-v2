import { getRequest, postRequest } from '../helpers/helpers.js';
import { getCameraDevices, removeOptions } from '../helpers/devices.js';
import {
  userNotificationMsg,
  errorMsg,
  successMsg,
  warningMsg,
} from './msg.js';
import { loader } from './loader.js';

const camera = document.querySelector('.attendance-camera');
let track;
const useTinyModel = true;
const refUser = {
  descriptor: null,
  queryDescriptor: null,
};
let intervalFace;
const devices = {
  videoDevice: null,
  selectedVideoId: null,
};

const tinyFaceOption = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
});

const onChangeCameraDevice = (e) => {
  loader();
  const valueId = e.currentTarget.value;
  devices.selectedVideoId = valueId;
  const constraint = { video: { deviceId: valueId } };
  try {
    navigator.mediaDevices.getUserMedia(constraint).then((mediaStream) => {
      const video = document.getElementById('video');
      video.srcObject = mediaStream;
    });
  } catch (err) {
    console.log(err.message);
  } finally {
    loader();
  }
};

const cameraDeviceHandler = async () => {
  const cameras = await getCameraDevices();
  devices.videoDevice = cameras;
  if (!cameras) return errorMsg('No Camera devices found');
  const select = document.getElementById('camera_device');
  for (const [index, device] of cameras.entries()) {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label;
    select.appendChild(option);
  }
  select.value = devices.videoDevice[0].deviceId;
};

const fetchPrevDescriptor = async () => {
  const url = `/get-descriptor`;
  const { descriptor, err, msg, warning } = await getRequest(url);
  if (err) return console.log(e);
  if (warning) return warningMsg(warning);
  if (descriptor) {
    const split = descriptor.split(',');
    const float32Arr = new Float32Array(split);
    // refUser.push([{ descriptor: float32Arr }]);
    refUser.descriptor = float32Arr;
    successMsg(msg);
  }
};

// VIDEO HANDLER
const startVideoHandler = async () => {
  loader();
  devices.videoDevice = null;
  const selected = document.getElementById('camera_device');
  selected.innerHTML = ``;
  await cameraDeviceHandler();
  if (devices.selectedVideoId) selected.value = devices.selectedVideoId;
  const backend = await faceapi.tf.getBackend();
  const vid = document.createElement('video');
  vid.id = 'video';
  vid.width = '1920';
  vid.height = '1080';
  vid.autoplay = true;
  vid.muted = true;

  const img = document.getElementById('img');
  if (img) img.remove();

  const submit = document.getElementById('submit-btn');
  if (submit) submit.remove();

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.remove();

  const canvas = document.getElementById('canvas');
  if (canvas) canvas.remove();

  const video = document.getElementById('video');
  if (!video) camera.insertBefore(vid, camera.firstChild);

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      vid.srcObject = stream;
      track = stream.getTracks();
      if (backend === 'webgl') faceDetection(500);

      const text = document.getElementById('video_text');
      if (!text) {
        informationDom('video_text', `Video: Working`);
      } else {
        text.textContent = 'Video: Working';
      }
    })
    .catch((e) => {
      if (e.name === 'NotAllowedError') {
        const dom = document.getElementById('video_error');
        if (!dom) {
          informationDom(`video_error`, `Video: Permission Denied by user`);
          errorMsg('Video: Permission Denied by user');
        }
      }
    })
    .finally(() => {
      loader();
    });
};

const faceDetection = (ms) => {
  const video = document.getElementById(`video`);
  const displaySize = { width: video.width, height: video.height };

  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.id = 'face_landmarks';
    camera.append(canvas);

    faceapi.matchDimensions(canvas, displaySize);

    // interval
    intervalFace = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, tinyFaceOption)
        .withFaceLandmarks(useTinyModel);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, ms);
  });
};

// PHOTO HANDLER
const photoHandler = async () => {
  loader();
  const video = document.getElementById('video');
  const landmarks = document.getElementById('face_landmarks');
  if (landmarks) landmarks.remove();
  try {
    if (!video) return errorMsg('Start the camera first!');
    const img = document.createElement('canvas');
    img.id = 'img';
    img.width = video.width;
    img.height = video.height;
    const context = img.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, video.width, video.height);
    const imgDom = document.getElementById('img');
    if (!imgDom) camera.append(img);

    const displaySize = { width: video.width, height: video.height };

    const canvas = await faceapi.createCanvasFromMedia(video);
    canvas.id = 'canvas';
    camera.append(canvas);
    // const id = document.getElementById('canvas');
    // face api detection
    const detection = await faceapi
      .detectAllFaces(canvas, tinyFaceOption)
      .withFaceLandmarks(useTinyModel)
      .withFaceDescriptors();

    // if no detection function done
    if (detection.length < 1 || detection.length > 1) {
      stopVideo();
      errorMsg('Image are invalid. Please Try again!');
      return startVideoHandler();
    }
    // if face is detected
    // stop video play
    stopVideo();
    // display face landmarks
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(detection, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // reset array
    // refUser.length = [];
    // input user array
    // refUser.push(detection);
    refUser.descriptor = detection[0].descriptor;
    // msg
    successMsg(
      'If you are satisfied with this photo try to recognize else retry'
    );
  } catch (err) {
    console.log(err);
  } finally {
    loader();
  }
};

// RECOGNIZE HANDLER
const recognizeHandler = async () => {
  try {
    loader();
    const video = document.getElementById('video');
    if (!video) return errorMsg('Start the camera first!');
    if (refUser.length === 0) return errorMsg('No Reference Image!');
    const img1 = refUser.descriptor;

    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.id = 'canvas';
    camera.append(canvas);
    // const id = document.getElementById('canvas');
    // face api detection
    const detection = await faceapi
      .detectAllFaces(canvas, tinyFaceOption)
      .withFaceLandmarks(useTinyModel)
      .withFaceDescriptors();
    // if no detection or some faces are detected
    if (detection.length < 1 || detection.length > 1) {
      stopVideo();
      errorMsg('Face invalid, try again');
      return startVideoHandler();
    }
    const img2 = detection[0].descriptor;
    stopVideo();
    // guard clause
    if (!img1) return errorMsg(`Record your face first!`);
    if (!img2) return errorMsg(`Face not recognize`);
    // comparing the 2 image
    await comparePerson(img1, img2);
  } catch (e) {
    console.log(e);
  } finally {
    loader();
  }
};

// compare the person
const comparePerson = async (referenceImg, queryImg) => {
  // guard clause if input is null
  if (!referenceImg) return errorMsg('Please register a face first');
  if (!queryImg) return errorMsg('No face detected!');
  // if both are defined run the face recognition

  // matching B query
  const distance = 0.4;
  const dist = faceapi.euclideanDistance(referenceImg, queryImg);
  if (dist <= distance) {
    successMsg(`Face are match! Please submit it to register`);
    createPostButton();
  } else {
    errorMsg('Face does not Match!');
  }
};

const informationDom = (id, text) => {
  const dom = `
  <p id='${id}'>${text}</p>
  `;
  return document.querySelector(`.text`).insertAdjacentHTML('beforeend', dom);
};

const informationHandler = async () => {
  const backend = await faceapi.tf.getBackend();
  informationDom(`backend`, `Browser backend: ${backend}`);
};

// stop video when capturing
const stopVideo = () => {
  const video = document.getElementById('video');
  const face_landmarks = document.getElementById('face_landmarks');
  const video_text = document.getElementById(`video_text`);
  if (video_text) video_text.textContent = 'Video: Stopped';
  if (video) {
    track[0].stop();
    video.remove();
  }
  if (face_landmarks) face_landmarks.remove();
  if (intervalFace) clearInterval(intervalFace);
};

const createPostButton = async () => {
  const buttons = document.getElementById('functionBtn');
  const button = document.createElement('button');
  button.classList.add('button');
  button.innerHTML = 'Submit';
  button.id = 'submit-btn';

  buttons.appendChild(button);
  button.addEventListener('click', showConfirm);
};

const showConfirm = () => {
  const modal = document.getElementById('modal-confirm');
  const confirmBtn = document.getElementById('confirm');
  const cancelBtn = document.getElementById('cancel');

  modal.style.display = 'block';

  cancelBtn.addEventListener('click', hideConfirm);
  confirmBtn.addEventListener('click', postToServer);
};

const hideConfirm = () => {
  document.getElementById('modal-confirm').style.display = 'none';
  document.getElementById('password').value = '';
};

const postToServer = async () => {
  // e.preventDefault();
  const password = document.getElementById('password');
  try {
    // const id = refUser[0];
    // const descriptor = id[0].descriptor.toString();
    const descriptor = refUser.descriptor.toString();
    const url = `/descriptor`;
    const post_data = { descriptor, password: password.value };
    const { err, msg } = await postRequest(url, post_data);
    if (err) return errorMsg(err);
    if (msg) window.location.href = msg;
  } catch (err) {
    console.log(err.message);
  } finally {
    hideConfirm();
  }
};

export {
  camera,
  track,
  refUser,
  fetchPrevDescriptor,
  startVideoHandler,
  photoHandler,
  stopVideo,
  recognizeHandler,
  comparePerson,
  createPostButton,
  postToServer,
  informationHandler,
  cameraDeviceHandler,
  onChangeCameraDevice,
};
