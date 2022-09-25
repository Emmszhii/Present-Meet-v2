const addClassListBtn = document.getElementById('add_class_list');

const classListHandler = () => {
  const list = document.getElementById('add_list');
  if (list) {
    list.remove();
  } else {
    document
      .querySelector('.add_class')
      .insertAdjacentHTML('beforeend', domAddClassList());

    document
      .getElementById(`add_list_btn`)
      .addEventListener('click', addClassList);
  }
};

const addClassList = () => {
  const subject = document.getElementById(`subject`);
  const section = document.getElementById(`section`);
  if (subject && section) {
    console.log(subject.value);
    console.log(section.value);
  }
};

const domAddClassList = () => {
  return `
    <div class="card" id="add_list">
      <div class='content'>
      <label for="subject">Subject</label>
        <input type="text" name="subject" id="subject">
        <label for="section">Section</label>
        <input type="text" name="section" id="section">
        <button type='button' class="button" id="add_list_btn">Add List</button>
      </div>
    </div>
  `;
};

addClassListBtn.addEventListener('click', classListHandler);
