import { userData, rtm, player } from './rtc.js';
import { faceRecognitionHandler } from './face_recognition.js';
import {
  userIdInDisplayFrame,
  displayFrame,
  resetTheFrames,
  expandVideoFrame,
  hideDisplayFrame,
} from './room.js';

const users = [];

// get members names and total and add it to the dom;
// member joining handler
const handleMemberJoin = async (MemberId) => {
  // console.log('A new member has joined the room', MemberId);
  addMemberToDom(MemberId);

  // update the participants total
  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);

  const { name } = await rtm.client.getUserAttributesByKeys(MemberId, ['name']);
  console.log(`User ${name} will join the room`);
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

  // addBotMessageToDom(`${name} has left the room!`);
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
    addMessageToDom(data.displayName, data.message);
  }

  // If user left delete them in the stream
  if (data.type === 'user_left') {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame.val === `user-container-${data.uid}`) {
      hideDisplayFrame();
    }
  }

  // if other user share a screen expand them in display frame
  if (data.type === 'user_screen_share') {
    const user = `user-container-${data.uid}`;
    const dom = document.getElementById(user);

    const child = displayFrame.children[0];
    if (child) {
      document.getElementById('streams__container').appendChild(child);
    }

    if (dom !== null) {
      displayFrame.style.display = 'block';
      displayFrame.appendChild(dom);
      userIdInDisplayFrame.val = user;
    } else {
      displayFrame.style.display = 'block';
      displayFrame.insertAdjacentHTML('beforeend', player(data.uid));
      document
        .getElementById(`user-container-${data.uid}`)
        .addEventListener('click', expandVideoFrame)
        .scrollIntoView();
    }
  }

  // if other screen share is close hide and reset frames
  if (data.type === 'user_screen_share_close') {
    hideDisplayFrame();
  }

  // if student
  if (userData.type === 'host' || userData.type === 'student') {
    // if a teacher or host decided to take attendance
    if (data.type === 'take_attendance') {
      faceRecognitionHandler();
      console.log(`face recognition`);
    }
    if (data.type === 'take_attendance_off') {
      console.log(`off face recognition`);
      // stopTimer();
    }
  }
};

// function to send message
const sendMessage = async (e) => {
  e.preventDefault();

  const message = e.target.message.value;
  if (message === '') return;

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
  sendMessage,
  getMembers,
  handleChannelMessage,
  handleMemberJoin,
  handleMemberLeft,
  addMemberToDom,
  addMessageToDom,
  leaveChannel,
};
