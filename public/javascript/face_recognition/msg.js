const body = document.body;

const errorMsg = (msg) => {
  resetMsg();
  const type = `error`;
  body.insertAdjacentHTML('afterbegin', msgDom(type, msg));
  addCloseListener(type, msg);
};

const successMsg = (msg) => {
  resetMsg();
  const type = `success`;
  body.insertAdjacentHTML('afterbegin', msgDom(type, msg));
  addCloseListener(type, msg);
};

const warningMsg = (msg) => {
  resetMsg();
  const type = `warning`;
  body.insertAdjacentHTML('afterbegin', msgDom(type, msg));
  addCloseListener(type, msg);
};

const userNotificationMsg = (msg) => {
  resetMsg();
  const type = `user_notification`;
  body.insertAdjacentHTML('afterbegin', msgDom(type, msg));
  addCloseListener(type, msg);
};

const addCloseListener = (type, title) => {
  document
    .getElementById(`close_${type}_${title}`)
    .addEventListener('click', (e) => {
      const dom = e.currentTarget.parentNode;
      if (dom) dom.remove();
    });
};

const resetMsg = () => {
  const errorDom = document.querySelector('.error_msg');
  const warningDom = document.querySelector('.warning_msg');
  const successDom = document.querySelector('.success_msg');
  const userJoinDom = document.querySelector('.user_notification_msg');
  if (userJoinDom) userJoinDom.remove();
  if (errorDom) errorDom.remove();
  if (warningDom) warningDom.remove();
  if (successDom) successDom.remove();
};

const msgDom = (type, title) => {
  return `
      <div class='${type}_msg'>
        <p>${title}</p>
        <button class='button_box close_btn' id='close_${type}_${title}'>
          <span class='close_msg'>&times;</span>
        </button>
      </div>
  `;
};

export { userNotificationMsg, errorMsg, successMsg, warningMsg, resetMsg };
