import { loader } from '../helpers/loader.js';
import { postRequest } from '../helpers/helpers.js';

const sendUserEmail = async (e) => {
  loader();
  const emailValue = document.getElementById('email').value;
  const url = `/forgot-password`;
  const postData = { emailValue };
  try {
    const { data, err, msg } = await postRequest(url, postData);
    console.log(data, err, msg);
  } catch (e) {
    console.log(e);
  } finally {
    loader();
  }
};

const keyPressEmail = async (e) => {
  const key = e.key;
  if (key === 'Enter') sendUserEmail();
};

export { sendUserEmail, keyPressEmail };
