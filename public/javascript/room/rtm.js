import { userData, rtm, player } from './rtc.js';
import { faceRecognitionHandler } from './face_recognition.js';
import {
  userNotificationMsg,
  errorMsg,
  warningMsg,
  successMsg,
} from './msg.js';
import {
  userIdInDisplayFrame,
  displayFrame,
  resetTheFrames,
  expandVideoFrame,
  hideDisplayFrame,
  checkIfUserDom,
  meetingId,
} from './room.js';
import { checkStudentDescriptor } from './attendance.js';
import { searchDataInArr } from '../helpers/helpers.js';
import { allStudentsDomHandler, deleteIdInArr } from './excel.js';
import {
  playSoundNotification,
  playSoundRaiseHand,
  playSoundStart,
} from '../helpers/sound.js';

const users = [];
const raiseHands = [];

const getRtmToken = async () => {
  const url = `/rtm`;
  const data = await getRequest(url);
  return data;
};

const handleRtmTokenExpire = async () => {
  const { rtmToken } = await getRtmToken();
  console.log(rtmToken);
  rtm.client.renewToken(rtmToken);
};

// get members names and total and add it to the dom;
// member joining handler
const handleMemberJoin = async (MemberId) => {
  addMemberToDom(MemberId);

  // update the participants total
  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);

  const { name } = await rtm.client.getUserAttributesByKeys(MemberId, ['name']);

  allStudentsDomHandler();
};

// add member dom when user join
const addMemberToDom = async (MemberId) => {
  // get user name
  const { name, rtcId } = await rtm.client.getUserAttributesByKeys(MemberId, [
    'name',
    'rtcId',
  ]);

  // store the their name in an array
  users.push({ name, rtcId, MemberId });

  const membersWrapper = document.getElementById('member__list');
  const memberItem = `
    <div class="member__wrapper" id="member__${MemberId}__wrapper">
      <span class="green__icon"></span>
      <p class="member_name">${name}</p>
    </div>
  `;
  membersWrapper.insertAdjacentHTML('beforeend', memberItem);
};

const addVideoPlayerToDom = async () => {
  const { name, _id } = await rtm.client.getChannelAttributesByKeys(meetingId, [
    'name',
    '_id',
  ]);

  if (!name && !_id) return;
  checkIfUserDom(_id.value, name.value);
};

const deleteVideoPlayerToDom = async () => {};

// function that update the total participants to the dom
const updateMemberTotal = async (members) => {
  const total = document.getElementById('members__count');
  total.innerText = members.length;
};

// member left handler
const handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);

  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);

  deleteIdInArr(MemberId);
};

// remove user dom when they left function
const removeMemberFromDom = async (MemberId) => {
  // removing remote users when they left
  for (let i = 0; users.length > i; i++) {
    if (users[i].MemberId === MemberId) {
      users.splice(i, 1);
    }
  }

  const memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  const name =
    memberWrapper.getElementsByClassName('member_name')[0].textContent;

  memberWrapper.remove();
};

// get members function
const getMembers = async () => {
  const members = await rtm.channel.getMembers();

  updateMemberTotal(members);

  for (let i = 0; members.length > i; i++) {
    addMemberToDom(members[i]);
  }
};

// message functionalities
// rtm channel message handler
const handleChannelMessage = async (messageData, MemberId) => {
  // Initialize data variable to parse the data
  const data = JSON.parse(messageData.text);

  // Add dom message element
  if (data.type === 'chat') {
    playSoundNotification();
    addMessageToDom(data.displayName, data.message);
  }

  if (data.type === 'user_join') {
    playSoundStart();
    checkIfUserDom(data.rtcId, data.name);
    userNotificationMsg(`User ${data.name} has joined the room`);
  }

  // If user left delete them in the stream
  if (data.type === 'user_left') {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame.val === `user-container-${data.uid}`)
      hideDisplayFrame();
  }

  if (data.type === 'raise_hand_on') {
    raiseHands.push({ _id: data._id, fullName: data.name });
    raiseHandHandler();
    playSoundRaiseHand();
  }

  if (data.type === 'raise_hand_off') {
    const index = raiseHands.findIndex((user) => user._id === data.id);
    raiseHands.splice(index);
    raiseHandHandler();
  }

  // if other user share a screen expand them in display frame
  if (data.type === 'user_screen_share') {
    const user = `user-container-${data.uid}`;
    const dom = document.getElementById(user);
    const child = displayFrame.children[0];

    if (child) document.getElementById('streams__container').appendChild(child);

    if (dom !== null) {
      displayFrame.style.display = 'block';
      displayFrame.appendChild(dom);
      userIdInDisplayFrame.val = user;
    } else {
      displayFrame.style.display = 'block';
      displayFrame.insertAdjacentHTML('beforeend', player(data.uid));
      document
        .getElementById(`user-container-${data.uid}`)
        .scrollIntoView()
        .addEventListener('click', expandVideoFrame);
    }
  }

  // if other screen share is close hide and reset frames
  if (data.type === 'user_screen_share_close') hideDisplayFrame();

  // if student
  if (userData.type === 'teacher' && data.type === 'attendance_data') {
    const { descriptor, displayName, restrict } = data;
    checkStudentDescriptor({ descriptor, MemberId, displayName, restrict });
  }

  if (userData.type === 'student') {
    const info = { MemberId, restrict: data.restrictVal };
    if (data.type === 'attendance_on') {
      if (data.restrictVal === 'on') {
        const students = data.students;
        const include = searchDataInArr(students, userData.id);
        if (include) faceRecognitionHandler(info);
      }
      if (data.restrictVal === 'off') faceRecognitionHandler(info);
    }
  }
};

const raiseHandHandler = () => {
  const body = document.body;
  const dom = document.querySelector('.raise_hand');
  const firstUser = raiseHands[0];
  const secondUser = raiseHands[1];

  if (!dom && firstUser) {
    body.insertAdjacentHTML('beforeend', raiseHandDom(firstUser.fullName));
  }
  const users = document.querySelector('.users');
  if (dom && secondUser) {
    users.innerHTML = `${firstUser.fullName} and ${secondUser}\n is rasing their hand <i class="fa-solid fa-hand"></i>`;
  }
  if (dom && raiseHands.length > 2) {
    users.innerHTML = `${firstUser.fullName}, ${secondUser}\nand other's is raising their hand <i class="fa-solid fa-hand"></i> `;
  }
  if (raiseHands.length === 0) {
    if (dom) dom.remove();
  }
};

const raiseHandDom = (name) => {
  return `
    <div class="raise_hand">
      <p class="users">${name} is raising a hand 
        <i class="fa-solid fa-hand"></i>
      </p>
    </div>
  `;
};

// function to send message
const sendMessage = async (e) => {
  e.preventDefault();

  const message = e.target.message.value;
  if (message.trim() === '') return;

  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'chat',
      message: message,
      displayName: userData.fullName,
    }),
  });

  addMessageToDom(userData.fullName, message);

  e.target.reset();
};

// users chat room
const addMessageToDom = (name, message) => {
  const messagesWrapper = document.getElementById('messages');

  const newMessage = `
    <div class='message__wrapper'>
      <div class='message__body'>
        <strong class="message__author">${name}</strong>
        <p class='message__text'>${message}</p>
      </div>
    </div>
  `;

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

  const lastMessage = document.querySelector(
    '#messages .message__wrapper:last-child'
  );

  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
};

// rtm leave channel async function
const leaveChannel = async () => {
  await rtm.channel.leave();
  await rtm.client.logout();
};

export {
  users,
  addVideoPlayerToDom,
  sendMessage,
  getMembers,
  handleChannelMessage,
  handleMemberJoin,
  handleMemberLeft,
  addMemberToDom,
  addMessageToDom,
  leaveChannel,
  getRtmToken,
  handleRtmTokenExpire,
};
