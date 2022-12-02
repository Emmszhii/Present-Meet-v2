import { tryCatchDeviceErr } from './error.js';
import { errorMsg } from './msg.js';
import {
  userData,
  device,
  rtc,
  localDevice,
  audio_devices,
  video_devices,
  clearLocalTracks,
  player,
  devices,
  rtm,
} from './rtc.js';
import { notificationMsg } from './rtm.js';

// getting meeting Link
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();

const checkMeetingId = () => {
  const id = urlParams.get('meetingId');
  if (!id) window.location.href = '*';
};

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
const userIdInDisplayFrame = { val: null };

const checkIfUserIsMobileHandler = () => {
  const isMobile = window.matchMedia(
    'only screen and (max-width:900px)'
  ).matches;

  const screenBtn = document.getElementById('screen-btn');
  if (isMobile) if (screenBtn) screenBtn.remove();
};

const checkIfUserDom = (id, name) => {
  const user = document.getElementById(`user-container-${id}`);
  if (!user) {
    document
      .getElementById('streams__container')
      .insertAdjacentHTML('beforeend', player(id, name));
    document
      .getElementById(`user-container-${id}`)
      .addEventListener('click', expandVideoFrame);
  }
};

// Expand VideoFrame Function
const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) document.getElementById('streams__container').appendChild(child);

  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget).scrollIntoView();
  userIdInDisplayFrame.val = e.currentTarget.id;

  resetTheFrames();
};

// for (let i = 0; videoFrames.length > i; i++) {
//   videoFrames[i].addEventListener('click', expandVideoFrame);
// }

// Hide Display Frame Function
const hideDisplayFrame = () => {
  userIdInDisplayFrame.val = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  resetTheFrames();
};

const resetTheFrames = () => {
  const videoFrames = document.getElementsByClassName('video__container');
  for (let i = 0; videoFrames.length > i; i++) {
    videoFrames[i].style.width = '300px';
    videoFrames[i].style.height = '200px';
  }
};

// Copy Meeting ID function
const copyClipboard = (e) => {
  const btn = e.currentTarget;
  const link = window.location.href;
  const text = `Present Meet
A video conferencing web app with face recognition attendance.

Open this link via google chrome browser in any desktop , android and ios for the features to work.

Here's the invitation link :
${link}

Enjoy using our service :D`;

  navigator.clipboard.writeText(text);
  btn.classList.toggle('copy');
  btn.classList.toggle('check');
  btn.disabled = true;
  setTimeout(() => {
    btn.classList.toggle('check');
    btn.classList.toggle('copy');
    btn.disabled = false;
  }, 3000);
};

const roomLoaderHandler = () => {
  const loader = document.getElementById('room_loader');
  if (loader) loader.classList.toggle('svg_spinner');
};

// message and participant toggle
const messagesToggle = (e) => {
  const btn = e.currentTarget;
  const x = document.getElementById('messages__container');
  const y = document.getElementById('members__container');
  const btnMsgNotification = document.getElementById('notification_msg');

  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    if (btnMsgNotification.classList.contains('red__icon')) notificationMsg();
    btn.classList.add('active');
    x.style.display = 'block';
  }
};

const membersToggle = (e) => {
  const btn = e.currentTarget;
  const x = document.getElementById('members__container');
  const y = document.getElementById('messages__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
};

const settingsToggle = () => {
  const btn = document.getElementById('settings-btn');
  const modal = document.getElementById('settings-modal');
  if (!modal) {
    resetDevices();
    settingsHandler();
    btn.classList.add('active');
  }
};

const setUserToFirstChild = (id) => {
  const container = document.getElementById('streams__container');
  const user = document.getElementById(`user-container-${id}`);
  if (!user) return;
  container.insertBefore(user, container.firstChild);
};

// create dropdown selected DOM
const createSelectElement = (name, val) => {
  const device_settings = document.getElementById('devices-settings');

  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  for (let i = 0; val.length > i; i++) {
    const option = document.createElement('option');
    option.value = val[i].label;
    option.text = val[i].label;
    select.appendChild(option);
  }

  const label = document.createElement('label');
  label.id = name;
  label.innerHTML = name;
  label.htmlFor = name;

  device_settings.appendChild(label);

  device_settings.appendChild(select).addEventListener('change', (e) => {
    const select = ['Audio', 'Video'];
    if (name === select[1]) {
      const dev = val.find((device) => device.label === e.target.value);
      rtc.localTracks[1]
        .setDevice(dev.deviceId)
        .catch((e) => errorMsg(e.message));
      device.localVideo = dev.deviceId;
    }
    if (name === select[0]) {
      const dev = val.find((device) => device.label === e.target.value);
      rtc.localTracks[0]
        .setDevice(dev.deviceId)
        .catch((e) => errorMsg(e.message));
      device.localAudio = dev.deviceId;
    }
  });

  // after settings are displayed then display the button to exit
  document.getElementById('setup-btn').style.display = 'block';
};

const resetDevices = () => {
  localDevice.length = 0;
  audio_devices.length = 0;
  video_devices.length = 0;
};

const refreshDeviceModal = () => {
  resetDevices();

  const dom = document.querySelector(`#modal-settings`);
  if (dom) dom.remove();

  clearLocalTracks();
  settingsHandler();
};

const settings_dom = () => {
  return `
    <div id="modal-settings" class="modal-settings">
      <div class="settings-modal">
        <div class='svg_spinner' id='loader_settings'></div>
        <span class="refresh" id="refresh">
          <i class="fa fa-refresh"></i>
        </span>
        <h3>Settings</h3>
        <div id="video-settings"></div>
        <div id="devices-settings"></div>
        <span class='text_settings'>Here's the devices available in your setup!</span>
        <button class="button_box" type="button" id="setup-btn">Done</button>
      </div>
    </div>
  `;
};

const settingsHandler = async () => {
  const dom = document.body;
  dom.insertAdjacentHTML('beforeend', settings_dom());
  const playerDom = document.getElementById(`user-container-${userData.rtcId}`);

  if (!playerDom) {
    document
      .getElementById('video-settings')
      .insertAdjacentHTML('beforeend', player(userData.rtcId, ''));

    document.querySelector('.video__container').style.cursor = 'auto';
  }
  try {
    rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    rtc.localTracks[1].play(`user-${userData.rtcId}`);

    devices().then(() => {
      const videoDom = document.getElementById('Video');
      const audioDom = document.getElementById('Audio');

      if (!device.localVideo) device.localVideo = video_devices[0].deviceId;
      if (!device.localAudio) device.localAudio = audio_devices[0].deviceId;

      if (!videoDom) createSelectElement('Video', video_devices);
      if (!audioDom) createSelectElement('Audio', audio_devices);
    });

    document
      .getElementById('setup-btn')
      .addEventListener('click', setupBtnOnClick);

    document
      .getElementById('refresh')
      .addEventListener('click', refreshDeviceModal);
  } catch (e) {
    console.log(e.message);
    const error = tryCatchDeviceErr(e.message);
    console.log(error);
    if (error) {
      permissionDeniedDom();
      return errorMsg(error.msg);
    }
  } finally {
    document.querySelector('#loader_settings').style.display = 'none';
  }
};

const setupBtnOnClick = () => {
  document.querySelector(`#modal-settings`).remove();
  document.getElementById('settings-btn').classList.remove('active');
  clearLocalTracks();
};

const permissionDeniedDom = () => {
  const dom = document.querySelector('.text_settings');
  const setupBtn = document.getElementById('setup-btn');
  const settingBtn = document.getElementById('settings-btn');

  if (dom)
    dom.innerHTML = `Allow the camera and audio permission to use camera and mic then refresh the page otherwise close this by clicking done.`;
  if (setupBtn)
    setupBtn.addEventListener('click', () => {
      document.getElementById('modal-settings').remove();
    });
  if (settingBtn) settingBtn.classList.remove('active');
};

const muteStream = async () => {
  const micBtn = document.getElementById('mic-btn');
  const camBtn = document.getElementById('camera-btn');
  if (rtc.localScreenTracks) {
    await rtc.client.unpublish([rtc.localScreenTracks]);
    await rtc.localScreenTracks.close();
    camBtn.style.display = 'block';
    document.getElementById('screen-btn').classList.remove('active');
    hideDisplayFrame();
    rtm.channel.sendMessage({
      text: JSON.stringify({
        type: 'user_screen_share_close',
        uid: userData.rtcId,
      }),
    });
  }

  if (micBtn.classList.contains('active')) {
    document.getElementById('mic-btn').classList.remove('active');
    await rtc.localTracks[0].setMuted(true);
  }
  if (camBtn.classList.contains('active')) {
    document.getElementById('camera-btn').classList.remove('active');
    await rtc.localTracks[1].setMuted(true);
  }
};

const raiseHand = async (e) => {
  const btn = e.currentTarget;
  if (btn.classList.contains('active')) {
    btn.classList.toggle('active');
    rtm.channel.sendMessage({
      text: JSON.stringify({
        type: 'raise_hand_off',
        name: userData.fullName,
        _id: userData.id,
      }),
    });
  } else {
    btn.classList.toggle('active');
    rtm.channel.sendMessage({
      text: JSON.stringify({
        type: 'raise_hand_on',
        name: userData.fullName,
        _id: userData.id,
      }),
    });
  }
};

export {
  displayFrame,
  videoFrames,
  userIdInDisplayFrame,
  meetingId,
  roomLoaderHandler,
  membersToggle,
  messagesToggle,
  copyClipboard,
  resetTheFrames,
  hideDisplayFrame,
  expandVideoFrame,
  settingsToggle,
  createSelectElement,
  refreshDeviceModal,
  settingsHandler,
  muteStream,
  checkIfUserDom,
  raiseHand,
  checkIfUserIsMobileHandler,
  setUserToFirstChild,
  checkMeetingId,
};
