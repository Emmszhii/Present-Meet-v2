import { userData, rtm } from './room_rtc.js';

let track;
const startingMinutes = 1;
let time = startingMinutes * 60;
let interval;

const dom = () => {
  return `
    <div class='modal_face'>
      <div class='modal_face_content'>
        <div id="msg"></div>
        <div id='countdown'>1:00</div>
        <div class='face_container'></div>
        <div class='buttons'>
          <button id="face_camera_btn">Camera</button>
          <button id='face_recognize_btn'>Recognize</button>
        </div>
      </div>
    </div>
  `;
};

const updateCountdown = () => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  const countdown = document.getElementById('countdown');
  if (countdown) {
    countdown.innerHTML = `${minutes}:${seconds}`;
  }
  time--;

  if (time <= 0) {
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
  time = startingMinutes * 60;
};

const startCamera = () => {
  const video = document.createElement('video');
  video.width = '720';
  video.height = '480';
  video.id = 'video';
  video.autoplay = true;
  video.muted = true;

  document.querySelector('.face_container').append(video);

  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
    video.play();
    track = stream.getTracks();
  });
};

const resetCamera = () => {
  const video = document.getElementById('video');
  const canvas = document.querySelector('canvas');
  if (video) {
    video.remove();
    startCamera();
  }
  if (canvas) {
    canvas.remove();
    startCamera();
  }
};

const stopCamera = () => {
  const video = document.getElementById('video');
  if (video) {
    track[0] = stop();
    video.remove();
  }
};

const createCanvas = () => {
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  canvas.width = video.width;
  canvas.height = video.height;
  const context = canvas.getContext('2d');

  if (video) {
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    document.querySelector('.face_container').append(canvas);

    stopCamera();
  } else {
    console.log(`start Camera first`);
  }
};

const faceRecognized = async () => {
  const video = document.getElementById('video');
  if (!video) return console.log(`please start the camera first`);
  createCanvas();
  const canvas = document.querySelector('canvas');
  const msg = document.getElementById('msg');

  const query = await faceapi
    .detectAllFaces(canvas)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!query || query.length > 1 || query[0].descriptor) {
    return (msg.textContent = 'Face not detected');
  }
  // convert string to float32array
  const float = userData.descriptor.split(',');
  const data = new Float32Array(float);

  if (query[0].descriptor) {
    const dist = faceapi.euclideanDistance(data, query[0].descriptor);

    console.log(dist);
    if (dist <= 0.4) {
      console.log(`match`);
      sendAttendance();
      stopTimer();
    } else {
      msg.textContent = 'Invalid match';
    }
  } else {
    msg.textContent = 'Face does not recognized';
  }
};

const sendAttendance = async () => {
  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'attendance',
      attendance: userData.fullName,
    }),
  });
};

const faceRecognitionHandler = () => {
  document.querySelector('.videoCall').insertAdjacentHTML('beforeend', dom());
  startCamera();

  interval = setInterval(updateCountdown, 1000);

  document
    .getElementById('face_camera_btn')
    .addEventListener('click', resetCamera);
  document
    .getElementById('face_recognize_btn')
    .addEventListener('click', faceRecognized);
};

// Teacher host
const attendanceBtn = () => {
  return `
    <button class='button' id='attendance-btn'><i class='fa-solid fa-clipboard-user'></i></button>
  `;
};

// attendance teacher, host handler
const makeAttendance = (e) => {
  document
    .querySelector('.rightBtn')
    .insertAdjacentHTML('afterbegin', attendanceBtn());

  document
    .getElementById('attendance-btn')
    .addEventListener('click', attendance);
};

const attendance = () => {
  const btn = document.getElementById('attendance-btn');

  if (btn.classList.contains('active')) {
    btn.classList.remove('active');
    rtm.channel.sendMessage({
      text: JSON.stringify({ type: 'take_attendance_off' }),
    });
  } else {
    btn.classList.add('active');
    rtm.channel.sendMessage({
      text: JSON.stringify({ type: 'take_attendance' }),
    });
  }
};

export { faceRecognitionHandler, makeAttendance };
