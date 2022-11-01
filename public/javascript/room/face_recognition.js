import { userData, rtc, rtm, localDevice } from './rtc.js';
import { getRequest } from '../helpers/helpers.js';
import { errorMsg, successMsg, warningMsg } from './msg.js';
import { muteStream } from './room.js';
import { getCameraDevices } from '../helpers/devices.js';

const useTinyModel = true;
let track;
const startingMinutes = 1;
const startingInterval = 1000;
const startingSeconds = 60;
let time = startingMinutes * startingSeconds;
const end_time = 0;
let interval;

const devices = {
  videoDevice: null,
  selectedVideoId: null,
};

const backend = async () => {
  try {
    return await faceapi.tf.getBackend();
  } catch (e) {
    console.log(e);
  }
};

const faceRecognitionHandler = async (teacherId) => {
  try {
    muteStream();
    const url = `/get-descriptor`;
    const { descriptor } = await get_descriptor();

    if (!descriptor) return warningMsg('No face registered by user');

    document.body.insertAdjacentHTML('beforeend', dom());

    document.querySelector('.modal_face_content').dataset.value = teacherId;

    document.getElementById(
      'backend'
    ).textContent = `User's Backend : ${await backend()}`;

    interval = setInterval(updateCountdown, startingInterval);

    document
      .querySelector('.close')
      .addEventListener('click', closeFaceRecognition);

    document
      .getElementById('camera_btn')
      .addEventListener('click', startCamera);

    document
      .getElementById('face_recognize_btn')
      .addEventListener('click', faceRecognized);
  } catch (e) {
    console.log(e);
  } finally {
    document.getElementById('loader_face').style.display = 'none';
  }
};

const dom = () => {
  return `
    <div class='modal_face'>
    <div class='modal_face_content'>
      <div class='svg_spinner' id="loader_face"></div>
      <span class='close'>&times;</span>
        <div class='title'>
          <p id='backend'></p>
          <span>webgl > cpu <i class='fa-solid fa-question' title="If cpu is your backend it may take a while else it should be faster"></i></span>
          </div>
        <div id="msg">
          <p id="video_title">Face Recognition attendance</p>
          <p id="error"></p>
          <p id="success"></p>
        </div>
        <div id='countdown'>1:00</div>
        <div class='face_container'>Please start camera</div>
        <div id="face_devices">
          <label for='devices'>Camera devices: </label>
          <select name='devices' id="camera_device">
            <option value disabled selected hidden>Turn on Camera first</option>
          </select>
        </div>
        <div class='buttons face_recognition_btn'>
          <button class='button' id='camera_btn'>
            <i class='fa-solid fa-camera'></i>
          </button>
          <button class='button' id='face_recognize_btn'>
            <i class='fa-solid fa-users-viewfinder'></i>
          </button>
        </div>
      </div>
    </div>
  `;
};

const sendAttendance = async (data) => {
  const { descriptor, id, displayName } = data;

  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'attendance_data',
      descriptor,
      id,
      displayName,
    }),
  });
};

const updateCountdown = () => {
  const minutes = Math.floor(time / 60);
  time--;
  let seconds = time % 60;

  const countdown = document.getElementById('countdown');
  if (countdown) {
    countdown.innerHTML = `Closing this window in : ${seconds}`;
  }

  if (time < end_time) {
    stopTimer();
  }
};

const stopTimer = () => {
  clearInterval(interval);
  const dom = document.querySelector('.modal_face');
  if (dom) {
    dom.remove();
  }
  const btn = document.getElementById('attendance-btn');
  if (btn) {
    btn.classList.remove('active');
  }
  time = startingMinutes * startingSeconds;
};

const startCamera = async () => {
  devices.videoDevice = null;
  document.getElementById('loader_face').style.display = 'block';
  document.querySelector('.face_container').innerHTML = '';
  stopCamera();
  removeFaceCanvas();

  const device = document.getElementById('camera_device');
  let constraint = { video: true };
  if (devices.selectedVideoId) {
    constraint = { video: { deviceId: devices.selectedVideoId } };
  }

  try {
    await cameraDeviceHandler();

    const stream = await navigator.mediaDevices.getUserMedia(constraint);
    if (stream) {
      if (devices.selectedVideoId) device.value = devices.selectedVideoId;
      const video = document.createElement('video');
      video.id = 'video';
      video.autoplay = true;
      video.muted = true;
      document.querySelector('.face_container').append(video);

      video.srcObject = stream;

      if (backend === 'webgl') face_detection();
      track = stream.getTracks();
    } else {
      errorMsg('Something went wrong on the camera');
    }
  } catch (e) {
    const arrError = ['Permission denied'];
    console.log(e.message);
    if (arrError.includes(e.message)) {
      errorMsg('Camera Permission denied by user');
    }
  } finally {
    document.getElementById('loader_face').style.display = 'none';
  }
};

const cameraDeviceHandler = async () => {
  const cameras = await getCameraDevices();
  if (cameras === typeof String) return errorMsg(cameras);
  if (!cameras) return errorMsg('No Camera devices found');
  devices.videoDevice = cameras;
  const select = document.getElementById('camera_device');
  select.innerHTML = ``;
  for (const [index, device] of cameras.entries()) {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.text = device.label;
    select.appendChild(option);
  }

  select.value = devices.videoDevice[0].deviceId;

  select.addEventListener('change', changeDeviceHandler);
};

const changeDeviceHandler = async (e) => {
  try {
    document.getElementById('loader_face').style.display = 'block';
    const deviceId = e.currentTarget.value;
    devices.selectedVideoId = deviceId;
    await startCamera();
  } catch (e) {
    console.log(e);
  } finally {
    document.getElementById('loader_face').style.display = 'none';
  }
};

const face_detection = () => {
  console.log(`run`);
};

const stopCamera = () => {
  const video = document.getElementById('video');
  if (video) {
    track[0] = stop();
    video.remove();
  }
};

const removeFaceCanvas = () => {
  const canvas = document.getElementById('user_face');
  if (canvas) canvas.remove();
};

const closeFaceRecognition = () => {
  const dom = document.querySelector('.modal_face');
  stopTimer();
  if (dom) dom.remove();
};

const faceRecognized = async () => {
  const loader = document.getElementById('loader_face');
  const video = document.getElementById('video');
  loader.style.display = 'block';
  try {
    const { descriptor, threshold } = await get_descriptor();
    // Guard clause
    if (!descriptor)
      return warningMsg('User face recognition is not registered');
    if (!video) return warningMsg(`Please start the camera first`);

    stopCamera();
    const canvas = await faceapi.createCanvasFromMedia(video);
    canvas.id = 'user_face';
    document.querySelector('.face_container').append(canvas);

    const query = await faceapi
      .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(useTinyModel)
      .withFaceDescriptors();

    if (query.length === 0 || query.length > 1) {
      return errorMsg('Invalid face. Please try again');
    }
    if (!query[0].descriptor) return errorMsg('Invalid Please Try again');

    // convert string to float32array
    const float = descriptor.split(',');
    const descriptorDb = new Float32Array(float);

    // if (query[0].descriptor) {
    const dist = await faceapi.euclideanDistance(
      descriptorDb,
      query[0].descriptor
    );
    console.log(dist);
    if (dist <= threshold) {
      successMsg(`User match`);
      sendAttendance({
        descriptor: query[0].descriptor.join(','),
        displayName: userData.fullName,
        id: userData._id,
      });
      stopTimer();
    } else {
      errorMsg('Not match. Please try again.');
    }
    // }
  } catch (e) {
    if (!video)
      return errorMsg('Please start camera first to use face recognition');
    console.log(e);
    console.log(e.message);
  } finally {
    if (loader) loader.style.display = 'none';
  }
};

const get_descriptor = async () => {
  const url = '/get-descriptor';
  const data = await getRequest(url);
  return data;
};

export {
  startingInterval,
  startingMinutes,
  startingSeconds,
  end_time,
  faceRecognitionHandler,
};
