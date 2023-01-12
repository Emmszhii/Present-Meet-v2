const cameraBtn = document.getElementById('camera-btn');
const screenBtn = document.getElementById('screen-btn');

import { makeAttendanceHandler } from './attendance.js';
import {
  users,
  getMembers,
  handleChannelMessage,
  handleMemberJoin,
  handleMemberLeft,
  handleRtmTokenExpire,
} from './rtm.js';
import {
  meetingId,
  displayFrame,
  userIdInDisplayFrame,
  expandVideoFrame,
  resetTheFrames,
  settingsHandler,
  roomLoaderHandler,
  checkIfUserDom,
  setUserToFirstChild,
  raiseHandler,
} from './room.js';
import { getRequest, postRequest } from '../helpers/helpers.js';
import { errorMsg } from './msg.js';
import { deleteIdInArr } from './excel.js';
import { tryCatchDeviceErr } from './error.js';
import { checkDeviceMuted } from './switch.js';
const userData = {}; // User Local Data and Tokens
const localDevice = []; // User Local Devices
const video_devices = [];
const audio_devices = [];
const device = {
  localAudio: null, // selected device
  localVideo: null,
  boolAudio: false,
  boolVideo: false,
  joined: false,
};
const rtc = {
  client: null,
  localTracks: null,
  dummyTracks: null,
  localScreenTracks: null,
  sharingScreen: false,
};
const rtm = {
  client: null,
  channel: null,
};
const remoteUsers = {}; // remote users
const player = (uid, name) => {
  return `
    <div class="video__container" id="user-container-${uid}">
      <div class="video-player" id="user-${uid}">
      </div>
      <div class='name'>
        <p>${name}</p>
      </div>
    </div>
    `; // player DOM element
};
const getRtcToken = async () => {
  const url = `/rtc/${meetingId}/publisher/uid/${userData.rtcId}`;
  const data = await getRequest(url);
  return data;
};
const data_init = async () => {
  try {
    const infoUrl = `/getInfo`;
    const { _id, first_name, middle_name, last_name, type, AGORA_APP_ID } =
      await getRequest(infoUrl);
    userData.type = type;
    userData.APP_ID = AGORA_APP_ID;
    userData.firstName = first_name;
    userData.middleName = middle_name;
    userData.lastName = last_name;
    userData.fullName = `${first_name} ${last_name}`;
    userData.id = _id;
    userData.rtcId = _id;
    userData.rtmId = _id;
    userData.dummyId = _id + '1234a';
    const rtcUrl = `/rtc/${meetingId}/publisher/uid`;
    const { rtcToken } = await getRequest(rtcUrl);
    userData.rtcToken = rtcToken;
    const rtmUrl = `/rtm`;
    const { rtmToken } = await getRequest(rtmUrl);
    userData.rtmToken = rtmToken;
  } catch (err) {
    console.log(err);
  } finally {
    joinRoomInit();
  }
};

const joinRoomInit = async () => {
  try {
    if (userData.type === 'teacher') makeAttendanceHandler();
    raiseHandler();
    rtm.client = await AgoraRTM.createInstance(userData.APP_ID, {
      logFilter: AgoraRTM.LOG_FILTER_WARNING,
    });
    const rtmOption = {
      uid: userData.rtmId,
      token: userData.rtmToken,
    };
    await rtm.client.login(rtmOption);
    await rtm.client.addOrUpdateLocalUserAttributes({
      name: userData.fullName,
      rtcId: userData.rtcId,
    });
    rtm.channel = await rtm.client.createChannel(meetingId);
    await rtm.channel.join();
    await rtm.channel.on('MemberJoined', handleMemberJoin);
    await rtm.channel.on('MemberLeft', handleMemberLeft);
    await rtm.channel.on('ChannelMessage', handleChannelMessage);
    await rtm.channel.on('token-privilege-will-expire', handleRtmTokenExpire);
    // get all members in render it to the dom
    getMembers();
    rtc.client = await AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }); // initialize setting the rtc
    await rtc.client.join(
      userData.APP_ID,
      meetingId,
      userData.rtcToken,
      userData.rtcId
    ); // join rtc with the params info
    await rtc.client.on('user-published', handleUserPublished);
    await rtc.client.on('user-left', handleUserLeft);
    await rtc.client.enableAudioVolumeIndicator();
    await rtc.client.on('volume-indicator', volumeIndicator);
    await rtc.client.on('token-privilege-will-expire', handleRtcTokenExpire); // on user publish and left method
    await settingsHandler(); // set the users camera and mic
  } catch (e) {
    console.log(e);
  } finally {
    roomLoaderHandler(); // if All are loaded loader will be gone
    // window.stop();
  }
}; // Initialize the application

const volumeIndicator = async (user) => {
  const streams = document.getElementById('streams__container');
  user.forEach((volume) => {
    const uid = volume.uid;
    const level = volume.level;
    const userContainer = document.getElementById(`user-container-${uid}`);
    if (!userContainer) return;
    if (level >= 1) {
      userContainer.style.border = `2px solid rgba(76,175,80,${level})`;
      if (userIdInDisplayFrame.val !== `user-container-${uid}`)
        streams.insertBefore(userContainer, streams.firstChild);
    }
    if (level < 1) userContainer.style.border = `1px solid #494949`;
  });
};

const handleRtcTokenExpire = async () => {
  try {
    const { rtcToken } = await getRtcToken();
    await rtc.client.renewToken(rtcToken);
  } catch (e) {
    console.log(e);
  }
};

const handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user; // set remote users as user
  await rtc.client.subscribe(user, mediaType); // subscribe to the meeting
  const playerDom = document.getElementById(`user-container-${user.uid}`);
  if (playerDom === null) {
    let name;
    for (let i = 0; users.length > i; i++) {
      if (users[i].rtcId === user.uid) {
        name = users[i].name;
      }
    }
    // add player to the dom
    document
      .getElementById('streams__container')
      .insertAdjacentHTML('beforeend', player(user.uid, name));
    //onClick user will be able to expand it
    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener('click', expandVideoFrame);
  } // if player is null then run it

  // if big screen is true let the other users resize their screen
  if (displayFrame.style.display) {
    const videoFrame = document.getElementById(`user-container-${user.uid}`);
    videoFrame.style.width = `300px`;
    videoFrame.style.height = `200px`;
  }

  try {
    if (mediaType === 'video') user.videoTrack.play(`user-${user.uid}`); // if media is VIDEO play their video in stream container
    if (mediaType === 'audio') user.audioTrack.play(); // if media is AUDIO play their audio
  } catch (e) {
    const arrErr = tryCatchDeviceErr(e.message);
    if (arrErr[0].err && arrErr[0].msg) return errorMsg(arrErr[0].msg);
    console.log(e.message);
  }
}; // user joined the meeting handler

const handleUserLeft = async (user) => {
  delete remoteUsers[user.uid]; // delete a remote user with their uid
  const item = document.getElementById(`user-container-${user.uid}`); // delete the dom of the user uid who left
  if (item) item.remove();
  if (userIdInDisplayFrame.val === `user-container-${user.uid}`) {
    displayFrame.style.display = null; // if user is on big display and left delete it
    resetTheFrames(); // reset user frames
  }
  deleteIdInArr(user.uid);
}; // user left the meeting

const toggleCamera = async (e) => {
  try {
    if (!device.localVideo) return errorMsg('No camera device detected');
    const button = e.currentTarget;
    if (rtc.localTracks[1].muted) {
      await rtc.localTracks[1].setMuted(false);
      await rtm.channel.sendMessage({
        text: JSON.stringify({ type: 'active_camera', _id: userData.id }),
      });
      setUserToFirstChild(userData.id);
      device.boolVideo = false;
      button.classList.add('active');
    } else {
      await rtc.localTracks[1].setMuted(true);
      button.classList.remove('active');
      device.boolVideo = true;
    } // rtc video muting
  } catch (err) {
    console.log(err);
  }
}; // Camera function

const toggleMic = async (e) => {
  try {
    if (!device.localAudio) return errorMsg('No microphone device detected');
    const button = e.currentTarget;
    if (rtc.localTracks[0].muted) {
      await rtc.localTracks[0].setMuted(false);
      button.classList.add('active');
      device.boolAudio = false;
    } else {
      await rtc.localTracks[0].setMuted(true);
      button.classList.remove('active');
      device.boolAudio = true;
    } // rtc audio muting
  } catch (err) {
    console.log(err);
  }
}; // Audio function
const switchToCamera = async () => {
  displayFrame.style.display = null; // reset the Display Frame
  // add the local user in the dom
  document
    .getElementById('streams__container')
    .insertAdjacentHTML('beforeend', player(userData.rtcId, userData.fullName));
  document
    .getElementById(`user-container-${userData.rtcId}`)
    .addEventListener('click', expandVideoFrame);
  // mute the local tracks of the user
  if (rtc.localTracks[0]) await rtc.localTracks[0].setMuted(true);
  if (rtc.localTracks[1]) await rtc.localTracks[1].setMuted(true);
  // removing the active class
  document.getElementById(`mic-btn`).classList.remove('active');
  document.getElementById(`screen-btn`).classList.remove('active');
  rtc.localTracks[1].play(`user-${userData.rtcId}`); // play the user video
  await rtc.client.publish([rtc.localTracks[1]]); // publish the video
}; // After disabling the share screen function then switch to Camera

// stop share screen handler
const handleStopShareScreen = async () => {
  rtc.sharingScreen = false;
  cameraBtn.style.display = 'block';
  if (screenBtn.classList.contains('active'))
    screenBtn.classList.remove('active');
  document.getElementById(`user-container-${userData.rtcId}`).remove(); // remove the local screen tracks to the dom
  //unpublish the local screen tracks
  await rtc.client.unpublish([rtc.localScreenTracks]);
  await rtc.localScreenTracks.close();
  resetTheFrames(); // reset users frame
  switchToCamera(); // then switch to camera
  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'user_screen_share_close',
      uid: userData.rtcId,
    }),
  });
};

const successShareScreen = async () => {
  try {
    const userDom = document.getElementById(`user-container-${userData.rtcId}`); // remove the local video screen
    rtc.sharingScreen = true;
    screenBtn.classList.add('active');
    cameraBtn.classList.remove('active');
    cameraBtn.style.display = 'none';
    if (userDom) userDom.remove();
    // display in big frame the player dom
    displayFrame.style.display = ' block';
    displayFrame.insertAdjacentHTML(
      'beforeend',
      player(userData.rtcId, userData.fullName)
    );
    document
      .getElementById(`user-container-${userData.rtcId}`)
      .addEventListener('click', expandVideoFrame);
    userIdInDisplayFrame.val = `user-container-${userData.rtcId}`;
    rtc.localScreenTracks.play(`user-${userData.rtcId}`);
    // unpublish the video track
    const videoTrack = rtc.localTracks[1] || null;
    if (videoTrack) await rtc.client.unpublish([rtc.localTracks[1]]);
    resetTheFrames(); // reset each user Frames

    rtm.channel.sendMessage({
      text: JSON.stringify({ type: 'user_screen_share', uid: userData.rtcId }),
    }); // sending my uid to make viewer view my local screen track

    await rtc.localScreenTracks.on('track-ended', handleStopShareScreen);
  } catch (e) {
    const err = tryCatchDeviceErr(e.message);
    if (err[0].err || !arr[err].msg) return;
    if (err[0].err || arr[err].msg) return errorMsg(arr[0].msg);
    console.log(e.message);
  } finally {
    await rtc.client.publish([rtc.localScreenTracks]);
  }
};

// Screen function
const toggleScreen = async (e) => {
  try {
    if (!rtc.sharingScreen) {
      let error = false; // let variable for error handling
      rtc.localScreenTracks = await AgoraRTC.createScreenVideoTrack({
        withAudio: 'auto',
      }).catch(async (err) => {
        console.log(err);
        const arrErr = tryCatchDeviceErr(err.message);
        rtc.sharingScreen = false;
        screenBtn.classList.remove('active');
        error = !error;
        if (arrErr[0].err && arrErr[0].msg) return errorMsg(arrErr[0].msg);
        if (arr[0].err) return;
        console.log(err.message);
      }); // run rtc localScreenTracks
      if (error === true) return; // if error is true this function will end
      await successShareScreen(); // if error is false this will run
    } else {
      handleStopShareScreen();
    }
  } catch (e) {
    console.log(e);
  }
};

AgoraRTC.onMicrophoneChanged = async (changedDevice) => {
  try {
    if (!rtc.localTracks[0].muted) {
      if (changedDevice.state === 'ACTIVE') {
        rtc.localTracks[0].setDevice(changedDevice.device.deviceId);
        // Switch to an existing device when the current device is unplugged.
      } else if (
        changedDevice.device.label === rtc.localTracks[0].getTrackLabel()
      ) {
        const oldMicrophones = await AgoraRTC.getMicrophones();
        oldMicrophones[0] &&
          rtc.localTracks[0].setDevice(oldMicrophones[0].deviceId);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

AgoraRTC.onCameraChanged = async (changedDevice) => {
  try {
    if (!rtc.localTracks[1].muted) {
      // When plugging in a device, switch to a device that is newly plugged in.
      if (changedDevice.state === 'ACTIVE') {
        rtc.localTracks[1].setDevice(changedDevice.device.deviceId);
        // Switch to an existing device when the current device is unplugged.
      } else if (
        changedDevice.device.label === rtc.localTracks[1].getTrackLabel()
      ) {
        const oldCameras = await AgoraRTC.getCameras();
        oldCameras[0] && rtc.localTracks[1].setDevice(oldCameras[0].deviceId);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const leaveLocalAttributeKey = async () => {
  try {
    await rtm.client.deleteLocalUserAttributesByKeys([
      'joinedName',
      'joinedId',
    ]);
  } catch (e) {
    console.log(e);
  }
};

const addJoinedUserLocalAttribute = async () => {
  await rtm.client.addOrUpdateLocalUserAttributes({
    joinedName: userData.fullName,
    joinedId: userData.rtcId,
  });
};

const hideButtons = () => {
  document.getElementsByClassName('mainBtn')[0].style.display = 'none';
  document.getElementsByClassName('middleBtn')[0].style.display = 'flex';
};

const showButtons = () => {
  document.getElementById('camera-btn').classList.remove('active');
  document.getElementById('mic-btn').classList.remove('active');
  document.getElementsByClassName('mainBtn')[0].style.display = 'flex';
  document.getElementsByClassName('middleBtn')[0].style.display = 'none';
};

const setRtcLocalStream = async () => {
  const userContainer = document.getElementById(
    `user-container-${userData.id}`
  );
  if (userContainer) userContainer.remove();
  if (device.joined === false) return;
  clearLocalTracks();
  rtc.client.unpublish();
  checkDeviceMuted();
  rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
    {
      config: { ANS: true },
      microphoneId: device?.localAudio,
    },
    { cameraId: device?.localVideo, facingMode: `user` }
  );
  checkIfUserDom(userData.id, userData.fullName);
  await rtc.localTracks[0].on('track-ended', audioTrackEnded);
  await rtc.localTracks[1].on('track-ended', videoTrackEnded);
  rtc.localTracks[0].setMuted(device.boolAudio);
  rtc.localTracks[1].setMuted(device.boolVideo);
  rtc.localTracks[1].play(`user-${userData.id}`);
  rtc.client.publish([rtc.localTracks[0], rtc.localTracks[1]]);
};

const joinStream = async () => {
  device.joined = true;
  try {
    roomLoaderHandler();
    hideButtons();
    clearLocalTracks();

    userJoinMsg();
    addJoinedUserLocalAttribute();
    setRtcLocalStream();
  } catch (e) {
    const errMsg = e.message;
    const err = tryCatchDeviceErr(e.message);
    if (err[0]) return errorMsg(err[0].msg);
    console.log(e);
    console.log(errMsg);
  } finally {
    roomLoaderHandler();
  }
}; // joining the stream

const userJoinMsg = async () => {
  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: `user_join`,
      rtcId: userData.id,
      name: userData.fullName,
    }),
  });
};

const audioTrackEnded = async () => {
  await rtc.localTracks[0].setMuted(true);
};

const videoTrackEnded = async () => {
  await rtc.localTracks[1].setMuted(true);
};

// leave stream
const leaveStream = async (e) => {
  try {
    e.preventDefault();
    device.joined = false;
    const user = document.getElementById(`user-container-${userData.rtcId}`);
    await rtc.client.unpublish([rtc.localTracks[0], rtc.localTracks[1]]);
    if (rtc.localScreenTracks) {
      await rtc.client.unpublish([rtc.localScreenTracks]);
      await rtc.localScreenTracks.close();
      rtc.sharingScreen = false;
      cameraBtn.style.display = 'block';
      screenBtn.classList.remove('active');
    }
    if (user) user.remove();
    if (userIdInDisplayFrame.val === `user-container-${userData.rtcId}`) {
      displayFrame.style.display = null;
      resetTheFrames();
    }

    rtm.channel.sendMessage({
      text: JSON.stringify({ type: 'user_left', uid: userData.rtcId }),
    });
  } catch (e) {
    const err = tryCatchDeviceErr(e.message);
    const error = err[0].err;
    const msgErr = err[0].msg;
    if (error && !msgErr) return;
    if (error && msgErr) return errorMsg(msgErr);
    console.log(e.message);
  } finally {
    clearLocalTracks();
    leaveLocalAttributeKey();
    showButtons();
  }
};
const clearLocalTracks = () => {
  const joined = device.joined;
  if (joined) return;
  if (!rtc.localTracks) return;
  if (rtc.localTracks !== null) {
    rtc.localTracks.forEach((track) => {
      track.stop();
      track.close();
    });
  }
};
const clearDummyTracks = () => {
  if (!rtc.dummyTracks) return;
  rtc.dummyTracks.forEach((track) => {
    track.close();
    track.stop();
  });
  rtc.dummyTracks = null;
};
const devices = async () => {
  try {
    const allDevices = await AgoraRTC.getDevices({
      skipPermissionCheck: false,
    });
    if (!allDevices)
      return {
        err: `Devices might be use by other app or access denied by the user`,
      };
    allDevices.map((item) => {
      if (item.deviceId !== 'default' && item.deviceId !== 'communications')
        localDevice.push(item);
    });
    localDevice.map((item) => {
      if (item.kind === 'videoinput') video_devices.push(item);
      if (item.kind === 'audioinput') audio_devices.push(item);
    });
    return { audioDev: audio_devices, cameraDev: video_devices };
  } catch (e) {
    console.log(e);
    console.log(e.message);
    return { err: e.message };
  }
};

export {
  remoteUsers,
  userData,
  rtc,
  rtm,
  device,
  localDevice,
  audio_devices,
  video_devices,
  setRtcLocalStream,
  clearLocalTracks,
  clearDummyTracks,
  joinRoomInit,
  data_init,
  handleUserLeft,
  handleUserPublished,
  handleStopShareScreen,
  handleChannelMessage,
  toggleCamera,
  toggleMic,
  toggleScreen,
  joinStream,
  leaveStream,
  player,
  devices,
  addJoinedUserLocalAttribute,
  leaveLocalAttributeKey,
};
