import { userData, rtm, player, leaveLocalAttributeKey } from './rtc.js';
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
  setUserToFirstChild,
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
  rtm.client.renewToken(rtmToken);
};
const handleMemberJoin = async (MemberId) => {
  addMemberToDom(MemberId);
  const members = await rtm.channel.getMembers();
  updateMemberTotal(members); // update the participants total
  const { name } = await rtm.client.getUserAttributesByKeys(MemberId, ['name']);
  allStudentsDomHandler();
}; // get members names and total and add it to the dom;// member joining handler
const addMemberToDom = async (MemberId) => {
  const { name, rtcId } = await rtm.client.getUserAttributesByKeys(MemberId, [
    'name',
    'rtcId',
  ]); // get user name
  const { joinedName, joinedId } = await rtm.client.getUserAttributesByKeys(
    MemberId,
    ['joinedName', 'joinedId']
  );
  if (joinedName && joinedId) checkIfUserDom(joinedId, joinedName);
  users.push({ name, rtcId, MemberId }); // store the their name in an array
  const membersWrapper = document.getElementById('member__list');
  const memberItem = `
    <div class="member__wrapper" id="member__${MemberId}__wrapper">
      <span class="green__icon"></span>
      <p class="member_name">${name}</p>
    </div>
  `;
  membersWrapper.insertAdjacentHTML('beforeend', memberItem);
}; // add member dom when user join

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
  for (let i = 0; users.length > i; i++) {
    if (users[i].MemberId === MemberId) users.splice(i, 1);
  } // removing remote users when they left
  const memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  const name =
    memberWrapper.getElementsByClassName('member_name')[0].textContent;

  memberWrapper.remove();
};

// get members function
const getMembers = async () => {
  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);
  for (let i = 0; members.length > i; i++) addMemberToDom(members[i]);
};
const handleChannelMessage = async (messageData, MemberId) => {
  // Initialize data variable to parse the data
  const data = JSON.parse(messageData.text);
  const btnMsgNotification = document.getElementById('notification_msg');
  const btnMsgContainer = document.getElementById('messages__container');

  if (data.type === 'chat') {
    playSoundNotification();
    addMessageToDom(data.displayName, data.message);
    if (
      !btnMsgNotification.classList.contains('red__icon') &&
      btnMsgContainer.style.display === 'none'
    )
      notificationMsg();
  } // Add dom message element

  if (data.type === 'user_join') {
    playSoundStart();
    checkIfUserDom(data.rtcId, data.name);
    userNotificationMsg(`User ${data.name} has joined the room`);
  }

  if (data.type === 'user_left') {
    const user = document.getElementById(`user-container-${data.uid}`);
    if (user) user.remove();
    if (userIdInDisplayFrame.val === `user-container-${data.uid}`)
      hideDisplayFrame();
  } // If user left delete them in the stream

  if (data.type === 'active_camera') setUserToFirstChild(data._id); // active camera

  if (data.type === 'raise_hand_on') {
    raiseHands.push({ _id: data._id, fullName: data.name });
    raiseHandHandler();
    playSoundRaiseHand();
  } // raise hand on

  if (data.type === 'raise_hand_off') {
    const index = raiseHands.findIndex((user) => user._id === data.id);
    raiseHands.splice(index);
    raiseHandHandler();
  } // raise hand off

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
  } // if other user share a screen expand them in display frame
  if (data.type === 'user_screen_share_close') hideDisplayFrame(); // if other screen share is close hide and reset frames
  if (userData.type === 'teacher' && data.type === 'attendance_data') {
    const { descriptor, displayName, restrict } = data;
    checkStudentDescriptor({ descriptor, MemberId, displayName, restrict });
  } // if student
  if (userData.type === 'student' && data.type === 'attendance_on') {
    const info = { MemberId, restrict: data.restrictVal };
    if (data.restrictVal === 'on') {
      const students = data.students;
      const include = searchDataInArr(students, userData.id);
      if (include) faceRecognitionHandler(info);
    }
    if (data.restrictVal === 'off') faceRecognitionHandler(info);
  }
}; // message functionalities// rtm channel message handler
const raiseHandHandler = () => {
  const body = document.body;
  const dom = document.querySelector('.raise_hand');
  const firstUser = raiseHands[0];
  const secondUser = raiseHands[1];
  if (!dom && firstUser)
    body.insertAdjacentHTML('beforeend', raiseHandDom(firstUser.fullName));
  const users = document.querySelector('.users');
  if (dom && secondUser)
    users.innerHTML = `${firstUser.fullName} and ${secondUser.fullName}\n is rasing their hand <i class="fa-solid fa-hand"></i>`;
  if (dom && raiseHands.length > 2)
    users.innerHTML = `${firstUser.fullName}, ${secondUser.fullName}\nand other's is raising their hand <i class="fa-solid fa-hand"></i> `;
  if (raiseHands.length === 0) if (dom) dom.remove();
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
const notificationMsg = () => {
  const btnNotification = document.getElementById('notification_msg');
  if (btnNotification) btnNotification.classList.toggle('red__icon');
};
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
}; // function to send message
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
  if (lastMessage) lastMessage.scrollIntoView();
}; // users chat room
const leaveChannel = async () => {
  leaveLocalAttributeKey();
  await rtm.channel.leave();
  await rtm.client.logout();
}; // rtm leave channel async function

export {
  users,
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
  notificationMsg,
};
