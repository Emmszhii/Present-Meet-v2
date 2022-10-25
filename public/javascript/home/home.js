// initializing the variables
const linkInput = document.getElementById('link');
const joinMeetingInput = document.getElementById('txtMeetingCode');
const modalJoin = document.getElementById('modal-join');
const modalCreate = document.getElementById('modal-create');
const xJoinModal = document.getElementsByClassName('close-join-modal')[0];

// let idRoom for random id generator
let idRoom;

// Random room id generator Code
function makeId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// COPY MEETING CODE
const copyClipboard = (e) => {
  const btn = e.currentTarget;

  const link = `${window.location.href}room?meetingId=${linkInput.value}`;
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

// Event Listeners
const xCreateModal = document.getElementsByClassName('close-create-modal')[0];
// show join modal
const showJoinModal = () => {
  modalJoin.style.display = 'block';
  document.getElementById('txtMeetingCode').focus();
};
// close join modal
const closeJoinModal = () => {
  modalJoin.style.display = 'none';
  joinMeetingInput.value = '';
};
// show create modal
const showCreateModal = () => {
  idRoom = makeId(9);
  modalCreate.style.display = 'block';
  linkInput.setAttribute('value', idRoom);
};
// close create modal
const closeCreateModal = () => {
  modalCreate.style.display = 'none';
};

export {
  idRoom,
  copyClipboard,
  showJoinModal,
  showCreateModal,
  closeJoinModal,
  closeCreateModal,
  makeId,
  modalJoin,
  modalCreate,
  xCreateModal,
  xJoinModal,
};
