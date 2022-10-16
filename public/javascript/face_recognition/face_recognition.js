import { postRequest } from '../helpers/helpers.js';

const preloader = document.getElementById('preloader');
const camera = document.querySelector('.attendance-camera');
let track;
const useTinyModel = true;
const refUser = [];
let intervalFace;

const tinyFaceOption = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
});

const fetchPrevDescriptor = async () => {
  const res = await fetch('/getDescriptor', { method: 'get' });
  const data = await res.json();
  if (res.status === 200) {
    if (data.descriptor) {
      const split = data.descriptor.split(',');
      const float32 = new Float32Array(split);
      refUser.push([{ descriptor: float32 }]);
      msgHandler('Previous face description is now added.');
    }
    if (data.warning) {
      warningHandler(data.warning);
    }
  }
  if (res.status === 400) {
    errorHandler(data.err);
  }
};

// VIDEO HANDLER
const startVideoHandler = async () => {
  resetMessages();
  const backend = faceapi.tf.getBackend();
  preloader.style.display = 'block';
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
      if (!text) informationDom('video_text', `Video: Working`);
    })
    .catch((e) => {
      if (e.name === 'NotAllowedError') {
        const dom = document.getElementById('video_error');
        if (!dom)
          informationDom(`video_error`, `Video: Permission Denied by user`);
      }
    })
    .finally(() => {
      preloader.style.display = 'none';
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
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
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
  resetMessages();
  preloader.style.display = 'block';
  const video = document.getElementById('video');
  const landmarks = document.getElementById('face_landmarks');
  if (landmarks) landmarks.remove();
  try {
    if (video) {
      const img = document.createElement('canvas');
      img.id = 'img';
      img.width = video.width;
      img.height = video.height;
      const context = img.getContext('2d');
      const imgDom = document.getElementById('img');
      if (!imgDom) camera.append(img);

      const displaySize = { width: video.width, height: video.height };

      context.imageSmoothingEnabled = false;
      context.drawImage(video, 0, 0, video.width, video.height);

      const canvas = faceapi.createCanvasFromMedia(video);
      canvas.id = 'canvas';
      camera.append(canvas);

      const id = document.getElementById('canvas');

      // face api detection
      const detection = await faceapi
        .detectAllFaces(id, tinyFaceOption)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors();

      // if no detection function done
      if (detection.length < 1 || detection.length > 1) {
        stopVideo();
        errorHandler('Image are invalid. Please Try again!');
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
      refUser.length = [];
      // input user array
      refUser.push(detection);
      // msg
      msgHandler(
        'If you are satisfied with this photo try to recognize else retry'
      );
    } else {
      errorHandler('Start the camera first!');
    }
  } catch (err) {
    console.log(err);
  } finally {
    preloader.style.display = 'none';
  }
};

// RECOGNIZE HANDLER
const recognizeHandler = async () => {
  resetMessages();
  preloader.style.display = 'block';
  const video = document.getElementById('video');
  try {
    if (video) {
      if (refUser.length === 0) {
        return errorHandler('No Reference Image !');
      }
      let img1 = refUser[0];
      let img2;

      const canvas = faceapi.createCanvasFromMedia(video);
      canvas.id = 'canvas';
      camera.append(canvas);

      const id = document.getElementById('canvas');

      // face api detection
      const detection = await faceapi
        .detectAllFaces(id, tinyFaceOption)
        .withFaceLandmarks(useTinyModel)
        .withFaceDescriptors();

      // if no detection
      if (detection.length < 1 || detection.length > 1) {
        stopVideo();
        errorHandler('Face invalid, try again');
        return startVideoHandler();
      }

      img2 = detection[0];

      stopVideo();
      // guard clause
      if (!img1) return errorHandler(`Record your face first!`);
      if (!img2) return errorHandler(`Face not recognize`);

      img1 = img1[0].descriptor;
      img2 = img2.descriptor;

      // comparing the 2 image
      comparePerson(img1, img2);
    } else {
      errorHandler('Start the camera first!');
    }
  } catch (e) {
    console.log(e);
  } finally {
    preloader.style.display = 'none';
  }
};

// compare the person
const comparePerson = async (referenceImg, queryImg) => {
  resetMessages();
  // guard clause if input is null
  if (!referenceImg) return errorHandler('Please register an image first');
  if (!queryImg) return errorHandler('Query img is invalid');
  // if both are defined run the face recognition
  if (queryImg) {
    // matching B query
    const distance = 0.4;
    const dist = faceapi.euclideanDistance(referenceImg, queryImg);
    if (dist <= distance) {
      msgHandler(`Face are match!`);
      createPostButton();
    } else {
      errorHandler('Face does not Match!');
    }
  } else {
    errorHandler('No face detected!');
  }
};

const informationDom = (id, text) => {
  const dom = `
  <p id='${id}'>${text}</p>
  `;
  return document.querySelector(`.text`).insertAdjacentHTML('beforeend', dom);
};

const informationHandler = () => {
  const backend = faceapi.tf.getBackend();
  informationDom(`backend`, `Browser backend: ${backend}`);
};

// stop video when capturing
const stopVideo = () => {
  const video = document.getElementById('video');
  const face_landmarks = document.getElementById('face_landmarks');
  if (video) {
    track[0].stop();
    video.remove();
  }
  if (face_landmarks) face_landmarks.remove();
  if (intervalFace) clearInterval(intervalFace);
};

const resetMessages = () => {
  const err = document.getElementById('err');
  const msg = document.getElementById('msg');
  const warning = document.getElementById('warning');
  if (err) err.remove();
  if (msg) msg.remove();
  if (warning) warning.remove();
};

const errorHandler = (err) => {
  const p = document.createElement('p');
  p.textContent = err;
  p.id = 'err';

  document.getElementById('messages').appendChild(p);
};

const warningHandler = (warning) => {
  const p = document.createElement('p');
  p.textContent = warning;
  p.id = 'warning';

  document.getElementById('messages').appendChild(p);
};

const msgHandler = (msg) => {
  const p = document.createElement('p');
  p.textContent = msg;
  p.id = 'msg';

  document.getElementById('messages').appendChild(p);
};

const createPostButton = async () => {
  const buttons = document.querySelector('.buttons');
  const button = document.createElement('button');
  button.classList.add('button');
  button.innerHTML = 'Submit';
  button.id = 'submit-btn';

  buttons.append(button);
  button.addEventListener('click', showConfirm);
};

const showConfirm = () => {
  resetMessages();
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

const postToServer = async (e) => {
  e.preventDefault();
  const password = document.getElementById('password');
  try {
    const id = refUser[0];
    const descriptor = id[0].descriptor.toString();
    const url = `/descriptor`;
    const post_data = { descriptor, password: password.value };
    const data = await postRequest(url, post_data);
    if (data.err) return errorHandler(data.err);
    if (data.msg) window.location.href = data.msg;
    // const response = await fetch(`/descriptor`, {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     descriptor,
    //     password: password.value,
    //   }),
    // });
    // const data = await response.json();
    // if (response.status === 200) {
    //   if (data.msg) {
    //     // return msgHandler(data.msg);
    //   } else {
    //     return errorHandler(data.err);
    //   }
    // } else {
    //   return errorHandler(data.err);
    // }
  } catch (err) {
    return errorHandler(err);
  } finally {
    hideConfirm();
  }
};

// const getUserCameraDevices = () => {
//   return navigator.mediaDevices.enumerateDevices().then((devices) => {
//     console.log(devices);
//     return devices.filter((item) => item.kind === 'videoinput');
//   });
// };

// getUserCameraDevices().then((i) => createSelectElement('Video', i));

// const createSelectElement = (name, val) => {
//   // dynamic select
//   const select = document.createElement('select');
//   select.name = name;
//   select.id = name;
//   for (let i = 0; val.length > i; i++) {
//     const option = document.createElement('option');
//     option.value = val[i].label;
//     option.text = val[i].label;
//     select.appendChild(option);
//   }

//   const label = document.createElement('label');
//   label.id = name;
//   label.innerHTML = name;
//   label.htmlFor = name;

//   document.getElementById('devices').appendChild(label).appendChild(select);
// };

export {
  preloader,
  camera,
  track,
  refUser,
  fetchPrevDescriptor,
  startVideoHandler,
  photoHandler,
  stopVideo,
  resetMessages,
  recognizeHandler,
  errorHandler,
  msgHandler,
  comparePerson,
  createPostButton,
  postToServer,
  informationHandler,
};
