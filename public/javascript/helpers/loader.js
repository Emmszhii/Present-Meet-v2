const body = document.body;

const loader = () => {
  const id = document.getElementById('loading');
  if (id) return id.remove();

  body.insertAdjacentHTML(
    'afterbegin',
    `<div class='loader' id='loading'></div>`
  );
};

export { loader };
