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
const copyClipboard = () => {
  const text = linkInput.value;
  navigator.clipboard.writeText(text);
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
