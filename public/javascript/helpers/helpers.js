const controller = new AbortController();

const postRequest = async (url, input) => {
  const { signal } = controller;

  const time = setTimeout(() => {
    controller.abort();
    return { err: `The request took too long` };
  }, 10000);

  const resp = await fetch(url, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal,
  });
  const data = await resp.json();
  if (data) clearTimeout(time);

  return data;
};

const getRequest = async (url) => {
  const { signal } = controller;

  const time = setTimeout(() => {
    controller.abort();
    return { err: `The request took too long` };
  }, 10000);

  const resp = await fetch(url, {
    method: 'get',
    signal,
  });
  const data = await resp.json();
  if (data) clearTimeout(time);

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

const searchDataInArr = (arr, id) => {
  for (const [index, value] of arr.entries()) {
    if (id === value._id) {
      return value;
    }
  }
};

const isHttps = () => {
  const http = document.location.protocol === 'https:';
  const redirect = '/connection-secure';
  if (!http) document.location.href = redirect;
  // return document.location.protocol === 'https:';
};

export {
  controller,
  postRequest,
  getRequest,
  randDarkColor,
  generateLightColorHex,
  searchDataInArr,
  isHttps,
};
