import { allVideoAndAudioDevices } from '../helpers/devices.js';
import { tryCatchDeviceErr } from './error.js';
import { errorMsg, successMsg } from './msg.js';
import {
  data_init,
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
  clearDummyTracks,
  setRtcLocalStream,
} from './rtc.js';
import { notificationMsg } from './rtm.js';
import {
  switchHandler,
  checkDeviceEnabled,
  checkSwitchToggle,
} from './switch.js';

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
const userIdInDisplayFrame = { val: null };
const checkMeetingId = () => {
  const id = urlParams.get('meetingId');
  if (!id) window.location.href = '*';
};

const raiseHandler = () => {
  if (userData.type !== 'student') return;

  const html = `
  <button class="button" id="raise-hand">
    <i class="fa-solid fa-hand"></i>
  </button>`;

  document.getElementById('camera-btn').insertAdjacentHTML('afterend', html);

  document.getElementById('raise-hand').addEventListener('click', raiseHand);
};

const appInitialize = async () => {
  checkMeetingId();
  const requirements = AgoraRTC.checkSystemRequirements();
  if (!requirements)
    return errorMsg(`Sorry this application does not support your device.`);
  // display the meeting link
  document.querySelector('.link').textContent = meetingId;
  checkIfUserIsMobileHandler();
  // load faces
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    await data_init(),
  ])
    .then(() => {
      console.log(`ALL MODEL AND INIT LOADED`);
    })
    .catch((err) => {
      console.log(err);
    });
};

const checkIfUserIsMobileHandler = () => {
  const isMobile = window.matchMedia(
    'only screen and (max-width:1000px)'
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

const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) document.getElementById('streams__container').appendChild(child);
  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget).scrollIntoView();
  userIdInDisplayFrame.val = e.currentTarget.id;
  resetTheFrames();
};

const hideDisplayFrame = () => {
  userIdInDisplayFrame.val = null;
  displayFrame.style.display = null;
  let child = displayFrame.children[0];
  if (child) document.getElementById('streams__container').appendChild(child);
  resetTheFrames();
}; // Hide Display Frame Function

const resetTheFrames = () => {
  const videoFrames = document.getElementsByClassName('video__container');
  for (let i = 0; videoFrames.length > i; i++) {
    videoFrames[i].style.width = '300px';
    videoFrames[i].style.height = '200px';
  }
};

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
  const memberBtn = document.getElementById('users-btn');
  const x = document.getElementById('messages__container');
  const y = document.getElementById('members__container');
  const btnMsgNotification = document.getElementById('notification_msg');

  if (y.style.display === 'block') {
    y.style.display = 'none';
    memberBtn.classList.remove('active');
  }
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
  const msgBtn = document.getElementById('chat-btn');
  const x = document.getElementById('members__container');
  const y = document.getElementById('messages__container');
  if (y.style.display === 'block') {
    y.style.display = 'none';
    msgBtn.classList.remove('active');
  }
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
};

const settingsToggle = (e) => {
  const btn = e.currentTarget;
  const modal = document.getElementById('settings-modal');
  const membersContainer = document.getElementById('members__container');
  const memberBtn = document.getElementById(`users-btn`);
  const messagesContainer = document.getElementById('messages__container');
  const messagesBtn = document.getElementById('chat-btn');

  if (membersContainer.style.display === 'block') {
    membersContainer.style.display = 'none';
    memberBtn.classList.remove('active');
  }
  if (messagesContainer.style.display === 'block') {
    messagesContainer.style.display = 'none';
    messagesBtn.classList.remove('active');
  }

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

const createSelectElement = (name, val) => {
  const device_settings = document.getElementById('devices-settings');
  const select = document.createElement('select');
  select.name = name;
  select.id = name;

  for (let i = 0; val.length > i; i++) {
    let option = document.createElement('option');
    option.value = val[i].label;
    option.text = val[i].label;
    option.dataset.deviceId = val[i].deviceId;
    option.dataset.kind = val[i].kind;
    if (val[i].deviceId === device.localAudio) {
      option.selected = true;
      console.log(val[i].deviceId, device.localAudio);
    }

    if (val[i].deviceId === device.localVideo) {
      option.selected = true;
      console.log(val[i].deviceId, device.localVideo);
    }
    select.appendChild(option);
  }
  const label = document.createElement('label');
  label.id = name;
  label.innerHTML = name;
  label.htmlFor = name;

  device_settings.appendChild(label);
  device_settings
    .appendChild(select)
    .addEventListener('change', changeSelectDeviceListener);

  document.getElementById('setup-btn').style.display = 'block';
}; // create dropdown selected DOM

const changeSelectDeviceListener = (e) => {
  const kind = e.currentTarget[e.target.selectedIndex].dataset.kind;
  const deviceId = e.currentTarget[e.target.selectedIndex].dataset.deviceId;
  try {
    if (kind === 'audioinput') {
      const dev = audio_devices.find((device) => device.deviceId === deviceId);
      device.localAudio = dev.deviceId;
      setRtcDummy();
    }
    if (kind === 'videoinput') {
      const dev = video_devices.find((device) => device.deviceId === deviceId);
      device.localVideo = dev.deviceId;
      setRtcDummy();
    }
  } catch (e) {
    const err = tryCatchDeviceErr(e.message);
    console.log(err);
    if (err[0].msg) return errorMsg(err[0].msg);
    console.log(e.message);
  }
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
        <div class='toggle-settings' id='toggle-settings'></div>
        <span class='text_settings'>Allow the use of camera and audio in the permission settings.</span>
        <button class="button_box" type="button" id="setup-btn">Done</button>
      </div>
    </div>
  `;
};

const selectDomElements = () => {
  const videoDom = document.getElementById('Video');
  const audioDom = document.getElementById('Audio');
  if (video_devices.length === 0 || audio_devices.length === 0)
    return errorMsg('Devices not detected');
  if (!device.localVideo) device.localVideo = video_devices[0].deviceId;
  if (!device.localAudio) device.localAudio = audio_devices[0].deviceId;
  console.log(device.localAudio, device.localVideo);
  if (!videoDom) createSelectElement('Video', video_devices);
  if (!audioDom) createSelectElement('Audio', audio_devices);
};

const setRtcDummy = async () => {
  const dummyId = userData.dummyId;
  const dummyContainer = document.getElementById(`user-container-${dummyId}`);
  const loader = document.getElementById('loader_settings');
  try {
    console.log(device.localAudio, device.localVideo);
    loader.style.display = 'block';
    if (dummyContainer) dummyContainer.remove();
    addPlayerToSettings();
    clearDummyTracks();
    rtc.dummyTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
      {
        config: { ANS: true },
        microphoneId: device?.localAudio,
      },
      { cameraId: device?.localVideo }
    );
    rtc.dummyTracks[0].setMuted(device.boolAudio);
    rtc.dummyTracks[1].setMuted(device.boolVideo);
    rtc.dummyTracks[1].play(`user-${dummyId}`);
  } catch (e) {
    console.log(e);
    permissionDeniedDom();
  } finally {
    loader.style.display = 'none';
  }
};

const addPlayerToSettings = () => {
  const dummyId = userData.dummyId;
  const playerDom = document.getElementById(`user-container-${dummyId}`);
  if (!playerDom) {
    document
      .getElementById('video-settings')
      .insertAdjacentHTML('beforeend', player(dummyId, ''));
    document.querySelector('.video__container').style.cursor = 'auto';
  }
};

const settingsHandler = async () => {
  const joined = device.joined;
  if (!joined) clearLocalTracks();
  const dom = document.body;
  dom.insertAdjacentHTML('beforeend', settings_dom());
  const loader = document.getElementById('loader_settings');
  loader.style.display = 'block';
  devices()
    .then(() => {
      selectDomElements();
    })
    .then(async () => {
      setRtcDummy();
      document.querySelector(
        '.text_settings'
      ).innerHTML = `Here's the devices available to your computer.`;
      switchHandler('toggle-settings', 'audio-switch');
      switchHandler('toggle-settings', 'camera-switch');
      checkDeviceEnabled();
      checkSwitchToggle();
    })
    .catch((e) => {
      const err = tryCatchDeviceErr(e.message);
      if (err[0]) permissionDeniedDom();
      if (err[0].msg) return errorMsg(err[0].msg);
      console.log(e);
    })
    .finally(() => {
      setBtnSettings();
      loader.style.display = 'none';
    });
};

const setBtnSettings = () => {
  document
    .getElementById('setup-btn')
    .addEventListener('click', setupBtnOnClick);
  document
    .getElementById('refresh')
    .addEventListener('click', refreshDeviceModal);
};

const setupBtnOnClick = async () => {
  const modal = document.getElementById(`modal-settings`);
  clearDummyTracks();
  if (modal) modal.remove();
  document.getElementById('settings-btn').classList.remove('active');
  setRtcLocalStream();
};

const permissionDeniedDom = () => {
  const dom = document.querySelector('.text_settings');
  const setupBtn = document.getElementById('setup-btn');
  const settingBtn = document.getElementById('settings-btn');
  if (dom)
    dom.innerHTML = `Allow the camera and audio permission to use them then refresh the page otherwise close this by clicking done.`;
  if (setupBtn)
    setupBtn.addEventListener('click', () => {
      document.getElementById('modal-settings').remove();
    });
  if (settingBtn) settingBtn.classList.remove('active');
  clearLocalTracks();
  clearDummyTracks();
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

const visibilityChangeHandler = async () => {
  try {
    if (rtc.localTracks[0]) rtc.localTracks[0].setMuted(true);
    if (rtc.localTracks[1]) rtc.localTracks[1].setMuted(true);
  } catch (e) {
    console.log(e);
  }
};

const keyDownHandler = (e) => {
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
};

export {
  displayFrame,
  videoFrames,
  userIdInDisplayFrame,
  meetingId,
  appInitialize,
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
  visibilityChangeHandler,
  raiseHandler,
  keyDownHandler,
};
