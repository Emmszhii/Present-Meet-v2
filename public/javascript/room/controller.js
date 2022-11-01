AgoraRTC.setLogLevel(2);

import {
  toggleCamera,
  toggleMic,
  toggleScreen,
  joinStream,
  leaveStream,
  data_init,
} from './rtc.js';
import { sendMessage, leaveChannel } from './rtm.js';
import {
  meetingId,
  membersToggle,
  messagesToggle,
  copyClipboard,
  hideDisplayFrame,
  settingsToggle,
  raiseHand,
  checkIfUserIsMobileHandler,
} from './room.js';
import { isHttps } from '../helpers/helpers.js';

// Event Listeners
// copy to clipboard
document.getElementById('link-btn').addEventListener('click', copyClipboard);
// messages toggle
document.getElementById('chat-btn').addEventListener('click', messagesToggle);
// participants toggle
document.getElementById('users-btn').addEventListener('click', membersToggle);
// Camera Button
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
// Mic Button
document.getElementById('mic-btn').addEventListener('click', toggleMic);
// Screen Share Button
document.getElementById('screen-btn').addEventListener('click', toggleScreen);
// Leave Stream
document.getElementById('leave-btn').addEventListener('click', leaveStream);
// Join Stream
document.getElementById('join-btn').addEventListener('click', joinStream);
// open settings modal
document
  .getElementById('settings-btn')
  .addEventListener('click', settingsToggle);
// // User send message
document
  .getElementById('message__form')
  .addEventListener('submit', sendMessage);
// toggle display Frame
document
  .getElementById('stream__box')
  .addEventListener('click', hideDisplayFrame);
// raise hand
document.getElementById('raise-hand').addEventListener('click', raiseHand);

// when a user forced close they will be deleted to the dom
window.addEventListener('beforeunload', leaveChannel);
// when users click esc btn close the msg & members modal
document.addEventListener('keydown', (e) => {
  const membersModal = document.getElementById('members__container');
  const messagesModal = document.getElementById('messages__container');
  const membersBtn = document.getElementById('users-btn');
  const messagesBtn = document.getElementById('chat-btn');

  if (e.key === 'Escape') {
    if ((membersModal.style.display = 'block')) {
      membersModal.style.display = 'none';
      membersBtn.classList.remove('active');
    }
    if ((messagesModal.style.display = 'block')) {
      messagesModal.style.display = 'none';
      messagesBtn.classList.remove('active');
    }
  }
});

window.addEventListener('load', async () => {
  const http = isHttps();
  if (!http) document.location.href = `/connection-secure`;

  // display the meeting link
  document.querySelector('.link').textContent = meetingId;
  await checkIfUserIsMobileHandler();
  // load faces
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    data_init(),
  ])
    .then(() => {
      console.log(`face api module success`);
    })
    .catch((err) => {
      console.log(err);
    });
});
