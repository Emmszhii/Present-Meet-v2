const updateStudentIcon = async (e) => {
  const btn = e.currentTarget;
  const id = e.currentTarget.dataset.id;

  if (btn.classList.contains('red__icon')) {
    btn.classList.toggle('red__icon');
    btn.classList.toggle('green__icon');
  } else if (btn.classList.contains('green__icon')) {
    btn.classList.toggle('green__icon');
    btn.classList.toggle('orange__icon');
  } else {
    btn.classList.toggle('orange__icon');
    btn.classList.toggle('red__icon');
  }
};

export { updateStudentIcon };
