const switchDom = (id, name) => {
  return `
  <div class='switch'">
    <input id="${id}" class="look" type="checkbox">
    <label for="${id}"></label>    
    <p>${name}</p>    
  </div>
  `;
};

const switchHandler = (insertHtml, id) => {
  const dom = document.getElementById(insertHtml);
  const name = id.split('-')[0];

  if (!dom) return;
  dom.insertAdjacentHTML('beforeend', switchDom(id, name));

  document.getElementById(id).addEventListener('change', switchEventHandler);
};

const switchEventHandler = (e) => {
  const btn = e.currentTarget;
  console.log(btn);
};

export { switchHandler };
