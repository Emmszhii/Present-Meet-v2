import { clearLocalTracks, device, rtc, userData } from './rtc.js';

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
  boolAudio === false ? (btnAudio.checked = true) : (btnAudio.checked = false);
  boolVideo === false
    ? (btnCamera.checked = true)
    : (btnCamera.checked = false);
};

const checkDeviceMuted = async () => {
  const micBtn = document.getElementById('mic-btn');
  const cameraBtn = document.getElementById('camera-btn');
  const boolAudio = device.boolAudio;
  const boolVideo = device.boolVideo;
  const joined = device.joined;

  if (joined) {
    if (!micBtn && !cameraBtn) return;
    boolAudio === false
      ? micBtn.classList.add('active')
      : micBtn.classList.remove('active');
    boolVideo === false
      ? cameraBtn.classList.add('active')
      : cameraBtn.classList.remove('active');

    // await rtc.localTracks[1].setMuted(boolVideo);
    // await rtc.localTracks[0].setMuted(boolAudio);
  }
};

const checkDeviceEnabled = () => {
  const joined = device.joined;
  const enabledAudio = device.boolAudio === true;
  const enabledVideo = device.boolVideo === true;
  if (!rtc.dummyTracks) return;
  if (!rtc.dummyTracks[1].isPlaying) return;
  if (!joined) {
    if (rtc.dummyTracks[0]) rtc.dummyTracks[0].setEnabled(enabledAudio);
    if (rtc.dummyTracks[1]) rtc.dummyTracks[1].setEnabled(enabledVideo);
  } else {
    clearLocalTracks();
  }
};

const switchEventHandler = async (e) => {
  const btn = e.currentTarget;
  const name = btn.id.split('-')[0];
  const setEnabledAudio = !device.boolAudio;
  const setEnabledVideo = !device.boolVideo;
  const dummyId = userData.dummyId;
  try {
    if (btn.checked) {
      if (name === 'audio') {
        device.boolAudio = false;
        if (rtc.dummyTracks[0]) rtc.dummyTracks[0].setMuted(setEnabledAudio);
      }
      if (name === 'camera') {
        device.boolVideo = false;
        if (rtc.dummyTracks[1].isPlaying === false)
          rtc.dummyTracks[1].play(`user-${dummyId}`);
        if (rtc.dummyTracks[1]) rtc.dummyTracks[1].setMuted(setEnabledVideo);
      }
    } else {
      if (name === 'audio') {
        device.boolAudio = true;
        if (rtc.dummyTracks[0]) rtc.dummyTracks[0].setMuted(setEnabledAudio);
      }
      if (name === 'camera') {
        device.boolVideo = true;
        if (rtc.dummyTracks[1]) rtc.dummyTracks[1].setMuted(setEnabledVideo);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export {
  switchHandler,
  checkDeviceEnabled,
  checkSwitchToggle,
  checkDeviceMuted,
};
