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

const backend = async () => {
  return await faceapi.tf.getBackend();
};

const onChangeCameraDevice = async (e) => {
  try {
    loader();
    const valueId = e.currentTarget.value;
    devices.selectedVideoId = valueId;
    await videoUserMedia();
  } catch (err) {
    console.log(err.message);
  } finally {
    loader();
  }
};

const videoUserMedia = async () => {
  const video = document.getElementById('video');
  if (!video) return errorMsg('Please start camera first');
  const text = document.getElementById('video_text');
  const dom = document.getElementById('video_error');
  const deviceValue = document.getElementById('camera_device').value;
  let constraint = { video: true };
  if (devices.selectedVideoId)
    constraint = { video: { deviceId: deviceValue } };
  try {
    const media = await navigator.mediaDevices.getUserMedia(constraint);
    video.srcObject = media;
    track = media.getTracks();

    if (!text) {
      informationDom('video_text', `Video: Working`);
    } else {
      text.textContent = 'Video: Working';
    }
  } catch (err) {
    const errArr = ['Permission denied'];
    if (errArr.includes(err.message))
      return errorMsg('Video: Permission Denied by User');

    console.log(err.message);
  }
};

const cameraDeviceHandler = async () => {
  const cameras = await getCameraDevices();

  if (cameras === typeof String) return errorMsg(cameras);
  if (!cameras) return errorMsg('No Camera devices found');
  devices.videoDevice = cameras;
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
    refUser.descriptor = float32Arr;
    successMsg(msg);
  }
};

const clearVideoAndCanvas = () => {
  const img = document.getElementById('img');
  if (img) img.remove();
  const submit = document.getElementById('submit-btn');
  if (submit) submit.remove();
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.remove();
  const canvas = document.getElementById('canvas');
  if (canvas) canvas.remove();
};

// VIDEO HANDLER
const startVideoHandler = async () => {
  loader();
  devices.videoDevice = null;
  const selected = document.getElementById('camera_device');
  selected.innerHTML = ``;
  selected.value = devices.selectedVideoId;
  const vid = document.createElement('video');
  vid.id = 'video';
  vid.width = '1920';
  vid.height = '1080';
  vid.autoplay = true;
  vid.muted = true;
  try {
    await cameraDeviceHandler();

    clearVideoAndCanvas();
    const video = document.getElementById('video');
    if (!video) camera.insertBefore(vid, camera.firstChild);
    await videoUserMedia();
    // if ((await backend()) === 'webgl') await faceDetection(500);
  } catch (err) {
    return errorMsg(err.message);
  } finally {
    loader();
  }
};

const faceDetection = async (ms) => {
  const video = document.getElementById(`video`);
  const displaySize = { width: video.width, height: video.height };
  video.addEventListener('play', async () => {
    const faceLandmarks = document.getElementById('face_landmarks');
    if (faceLandmarks) return;
    const canvas = await faceapi.createCanvasFromMedia(video);
    canvas.id = 'face_landmarks';

    camera.append(canvas);
    await faceapi.matchDimensions(canvas, displaySize);

    // interval
    intervalFace = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, tinyFaceOption)
        .withFaceLandmarks(useTinyModel);

      const resizedDetections = await faceapi.resizeResults(
        detections,
        displaySize
      );

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      await faceapi.draw.drawDetections(canvas, resizedDetections);
      await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }, ms);
  });
};

// PHOTO HANDLER
const photoHandler = async () => {
  loader();
  try {
    const video = document.getElementById('video');
    if (!video) return errorMsg('Start the camera first!');
    const displaySize = { width: video.width, height: video.height };
    const imgDom = document.getElementById('img');
    const img = document.createElement('canvas');
    img.id = 'img';
    img.width = video.width;
    img.height = video.height;
    const context = img.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, video.width, video.height);
    if (!imgDom) camera.append(img);

    const canvas = await faceapi.createCanvasFromMedia(video);
    canvas.id = 'canvas';
    camera.append(canvas);

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
    await faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = await faceapi.resizeResults(
      detection,
      displaySize
    );
    await faceapi.draw.drawDetections(canvas, resizedDetections);
    await faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // store user descriptor
    refUser.descriptor = detection[0].descriptor;
    successMsg(
      'If you are satisfied with this photo try to recognize else retry'
    );
  } catch (err) {
    console.log(err.message);
  } finally {
    loader();
  }
};

// RECOGNIZE HANDLER
const recognizeHandler = async () => {
  loader();
  try {
    const video = document.getElementById('video');
    if (!video) return errorMsg('Start the camera first!');
    if (refUser.length === 0) return errorMsg('No reference descriptor!');
    const img1 = refUser.descriptor;
    const canvas = await faceapi.createCanvasFromMedia(video);
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
  if (!ArrayBuffer.isView(referenceImg))
    return errorMsg(`Record your face descriptor first!`);
  if (!ArrayBuffer.isView(queryImg)) return errorMsg(`Face not recognize`);
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

const informationHandler = async () => {
  const backend = await faceapi.tf.getBackend();
  informationDom(`backend`, `Users' browser backend : ${backend}`);
};

const informationDom = (id, text) => {
  const dom = `
  <p id='${id}'>${text}</p>
  `;
  return document.querySelector(`.text`).insertAdjacentHTML('beforeend', dom);
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
