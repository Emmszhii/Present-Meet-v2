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

export { postRequest, getRequest };
