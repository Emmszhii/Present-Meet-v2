const dom = document.getElementById('errors_dom');
const errorMsg = (msg) => {
  deleteAllMsg();

  if (!dom.classList.contains('errors')) dom.classList.add('errors');
  dom.innerHTML = `
    <p>${msg}</p>
  `;
};

const warningMsg = (msg) => {
  deleteAllMsg();
  if (!dom.classList.contains('warning')) dom.classList.add('warnings');
  dom.innerHTML = `
    <p>${msg}</p>
  `;
};

const successMsg = (msg) => {
  deleteAllMsg();
  if (!dom.classList.contains('success')) dom.classList.add('success');
  dom.innerHTML = `
    <p>${msg}</p>
  `;
};

const deleteAllMsg = () => {
  if (dom.classList.contains('errors')) {
    dom.classList.remove('errors');
  } else if (dom.classList.contains('warnings')) {
    dom.classList.remove('warnings');
  } else if (dom.classList.contains('success')) {
    dom.classList.remove('success');
  }
  dom.innerHTML = ``;
};

export { errorMsg, warningMsg, successMsg };
