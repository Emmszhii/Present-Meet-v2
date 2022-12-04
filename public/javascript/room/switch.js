import { device, rtc } from './rtc.js';

const switchDom = (id, name) => {
  return `
  <div class='switch'">
    <input id="${id}" class="look" type="checkbox" checked>
    <label for="${id}"></label>    
    <p>${name}</p>    
  </div>
  `;
};

const switchHandler = (insertHtml, id) => {
  const dom = document.getElementById(insertHtml);
  const name = id.split('-')[0];

  if (!dom) return;
  dom.insertAdjacentHTML('beforeend', switchDom(id, name));

  document.getElementById(id).addEventListener('change', switchEventHandler);
};

const checkSwitchToggle = () => {
  const btnAudio = document.getElementById('audio-switch');
  const btnCamera = document.getElementById('camera-switch');
  const boolAudio = device.boolAudio;
  const boolVideo = device.boolVideo;
  if (!btnAudio && !btnCamera) return;
  if (!boolAudio) btnAudio.checked = false;
  if (!boolVideo) btnCamera.checked = false;
};

const checkDeviceMuted = async () => {
  const micBtn = document.getElementById('mic-btn');
  const cameraBtn = document.getElementById('camera-btn');
  const boolAudio = !device.boolAudio;
  const boolVideo = !device.boolVideo;
  if (!micBtn && !cameraBtn) return;
  if (!boolAudio) micBtn.classList.toggle('active');
  if (!boolVideo) cameraBtn.classList.toggle('active');
  await rtc.localTracks[1].setMuted(boolVideo);
  await rtc.localTracks[0].setMuted(boolAudio);
};

const checkDeviceEnabled = () => {
  if (rtc.localTracks[0]) rtc.localTracks[0].setEnabled(device.boolAudio);
  if (rtc.localTracks[1]) rtc.localTracks[1].setEnabled(device.boolVideo);
};

const switchEventHandler = async (e) => {
  const btn = e.currentTarget;
  const name = btn.id.split('-')[0];
  if (btn.checked) {
    if (name === 'audio') {
      device.boolAudio = true;
      if (rtc.localTracks[0]) rtc.localTracks[0].setEnabled(true);
    }
    if (name === 'camera') {
      device.boolVideo = true;
      if (rtc.localTracks[1]) rtc.localTracks[1].setEnabled(true);
    }
  } else {
    if (name === 'audio') {
      device.boolAudio = false;
      if (rtc.localTracks[0]) rtc.localTracks[0].setEnabled(false);
    }
    if (name === 'camera') {
      device.boolVideo = false;
      if (rtc.localTracks[1]) rtc.localTracks[1].setEnabled(false);
    }
  }
};

export {
  switchHandler,
  checkDeviceEnabled,
  checkSwitchToggle,
  checkDeviceMuted,
};
