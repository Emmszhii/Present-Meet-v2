AgoraRTC.setLogLevel(3);
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
  appInitialize,
  membersToggle,
  messagesToggle,
  copyClipboard,
  hideDisplayFrame,
  settingsToggle,
  keyDownHandler,
} from './room.js';

// Event Listeners
document.getElementById('link-btn').addEventListener('click', copyClipboard); // copy to clipboard
document.getElementById('chat-btn').addEventListener('click', messagesToggle); // messages toggle
document.getElementById('users-btn').addEventListener('click', membersToggle); // participants toggle
document.getElementById('camera-btn').addEventListener('click', toggleCamera); // Camera Button
document.getElementById('mic-btn').addEventListener('click', toggleMic); // Mic Button
document.getElementById('screen-btn').addEventListener('click', toggleScreen); // Screen Share Button
document.getElementById('leave-btn').addEventListener('click', leaveStream); // Leave Stream
document.getElementById('join-btn').addEventListener('click', joinStream); // Join Stream
document
  .getElementById('settings-btn')
  .addEventListener('click', settingsToggle); // open settings modal
document
  .getElementById('message__form')
  .addEventListener('submit', sendMessage); // // User send message
document
  .getElementById('stream__box')
  .addEventListener('click', hideDisplayFrame); // toggle display Frame

window.addEventListener('beforeunload', leaveChannel); // when a user forced close they will be deleted to the dom

document.addEventListener('keydown', keyDownHandler); // when users click esc btn close the msg & members modal

document.addEventListener('DOMContentLoaded', appInitialize);
