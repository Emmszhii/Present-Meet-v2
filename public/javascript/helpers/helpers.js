const postRequest = async (url, input) => {
  const resp = await fetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  const data = await resp.json();
  console.log(data);
  return data;
};

const getRequest = async (url) => {
  const resp = await fetch(url, {
    method: 'get',
  });
  const data = await resp.json();
  console.log(data);
  return data;
};

function randDarkColor() {
  var lum = -0.25;
  var hex = String(
    '#' + Math.random().toString(16).slice(2, 8).toUpperCase()
  ).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var rgb = '#',
    c,
    i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }
  return rgb;
}

function generateLightColorHex() {
  let color = '#';
  for (let i = 0; i < 3; i++)
    color += (
      '0' + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
    ).slice(-2);
  return color;
}

// error, success ,warning functions & view
const closeParentNode = (e) => {
  const dom = e.currentTarget.parentNode;
  if (dom) dom.remove();
};

const body = document.querySelector('body');

const errorMessage = () => {
  return `
    <div class="error_msg">
      <div class="errorMsg"></div>
      <button class='button error_btn'><span>&times;</span></button>
    </div>
  `;
};
const successMessage = () => {
  return `
    <div class="success_msg">
      <div class="successMsg"></div>
      <button class='button success_btn'><span>&times;</span></button>
    </div>
  `;
};
const warningMessage = () => {
  return `
    <div class="warning_msg">
      <div class="warningMsg"></div>
      <button class='button warning_btn'><span>&times;</span></button>
    </div>
  `;
};
const successDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.success_msg');
  let domText = document.querySelector('.successMsg');

  if (!addDom) {
    body.insertAdjacentHTML('beforeend', successMessage());
    domText = document.querySelector('.successMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.success_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const warningDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.warning_msg');
  let domText = document.querySelector('.warningMsg');

  if (!addDom) {
    body.insertAdjacentHTML('beforeend', warningMessage());
    domText = document.querySelector('.warningMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.warning_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const errorDom = (msg) => {
  deleteMsg();
  const addDom = document.querySelector('.error_msg');
  let domText = document.querySelector('.errorMsg');
  if (!addDom) {
    body.insertAdjacentHTML('beforeend', errorMessage());
    domText = document.querySelector('.errorMsg');
    domText.textContent = msg;
    const btn = document.querySelector('.error_btn');
    btn.addEventListener('click', closeParentNode);
  } else {
    domText.textContent = msg;
  }
};

const deleteMsg = () => {
  const errDom = document.querySelector('.error_msg');
  const warnDom = document.querySelector('.warning_msg');
  const successDom = document.querySelector('.success_msg');

  if (errDom) errDom.remove();
  if (warnDom) warnDom.remove();
  if (successDom) successDom.remove();
};

const svgLoader = (container) => {
  if (container.querySelector('.svg_spinner') === null) {
    container.insertAdjacentHTML(
      'beforeend',
      `<div class='svg_spinner'></div>`
    );
    console.log(`this run`);
  } else {
    const dom = container.querySelector('.svg_spinner');
    dom.remove();
  }
};

export {
  postRequest,
  getRequest,
  randDarkColor,
  generateLightColorHex,
  svgLoader,
};
