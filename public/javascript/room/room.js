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
} from './rtc.js';

// getting meeting Link
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
const userIdInDisplayFrame = { val: null };

// Expand VideoFrame Function
const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget).scrollIntoView();
  userIdInDisplayFrame.val = e.currentTarget.id;

  resetTheFrames();
};

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

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
const copyClipboard = () => {
  const link = window.location.href;
  const text = `Present Meet
A video conferencing web app with face recognition attendance.

Open this link via google chrome browser in any desktop , android and ios for the features to work.

Here's the invitation link :
${link}

Enjoy using our service :D`;
  navigator.clipboard.writeText(text);
};

// message and participant toggle
const messagesToggle = (e) => {
  const btn = e.currentTarget;
  const x = document.getElementById('messages__container');
  const y = document.getElementById('members__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
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
      rtc.localTracks[1].setDevice(dev.deviceId).catch((e) => console.log(e));
      device.localVideo = dev.deviceId;
    }
    if (name === select[0]) {
      const dev = val.find((device) => device.label === e.target.value);
      rtc.localTracks[0].setDevice(dev.deviceId).catch((e) => console.log(e));
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
        <span class="refresh" id="refresh">
          <i class="fa fa-refresh"></i>
        </span>
        <h3>Settings</h3>
        <div id="video-settings"></div>
        <div id="devices-settings"></div>
        <span>Here's the devices available in your setup!</span>
        <button class="button_box" type="button" id="setup-btn">Done</button>
      </div>
    </div>
  `;
};

const settingsHandler = async () => {
  const dom = document.querySelector(`.videoCall`);
  dom.insertAdjacentHTML('beforeend', settings_dom());

  const playerDom = document.getElementById(`user-container-${userData.rtcId}`);
  if (!playerDom) {
    document
      .getElementById('video-settings')
      .insertAdjacentHTML('beforeend', player(userData.rtcId, ''));

    document.querySelector('.video__container').style.cursor = 'auto';
  }
  rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  rtc.localTracks[1].play(`user-${userData.rtcId}`);

  devices().then(() => {
    if (!device.localVideo) device.localVideo = video_devices[0].deviceId;
    if (!device.localAudio) device.localAudio = audio_devices[0].deviceId;

    console.log(video_devices, audio_devices);
    const videoDom = document.getElementById('Video');
    const audioDom = document.getElementById('Audio');
    if (!videoDom) {
      createSelectElement('Video', video_devices);
    }
    if (!audioDom) {
      createSelectElement('Audio', audio_devices);
    }
  });

  document.getElementById('setup-btn').addEventListener('click', () => {
    document.querySelector(`#modal-settings`).remove();
    document.getElementById('settings-btn').classList.remove('active');
    clearLocalTracks();
  });

  document
    .getElementById('refresh')
    .addEventListener('click', refreshDeviceModal);
};

export {
  displayFrame,
  videoFrames,
  userIdInDisplayFrame,
  meetingId,
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
};
