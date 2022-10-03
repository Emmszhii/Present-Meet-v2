import {
  copyClipboard,
  showJoinModal,
  showCreateModal,
  closeJoinModal,
  closeCreateModal,
  idRoom,
  makeId,
  modalJoin,
  modalCreate,
  xCreateModal,
  xJoinModal,
} from './home.js';

// event listeners
document.getElementById('copy-link').addEventListener('click', copyClipboard);
document
  .getElementById('btn-join-modal')
  .addEventListener('click', showJoinModal);
document
  .getElementById('btn-create-modal')
  .addEventListener('click', showCreateModal);

xJoinModal.addEventListener('click', closeJoinModal);
xCreateModal.addEventListener('click', closeCreateModal);

// onload
window.addEventListener('load', () => {
  // idRoom = makeId(9);
});

// onclick modals
window.onclick = (e) => {
  if (e.target === modalJoin) {
    modalJoin.style.display = 'none';
  }
  if (e.target === modalCreate) {
    modalCreate.style.display = 'none';
  }
};

// on keypress
document.addEventListener('keydown', (e) => {
  // escape key
  if (e.key === 'Escape') {
    if ((modalJoin.style.display = 'block')) {
      closeJoinModal();
    }
    if ((modalCreate.style.display = 'block')) {
      closeCreateModal();
    }
  }
});
