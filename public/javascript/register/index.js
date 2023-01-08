const showPassword = (e) => {
  const btn = e.currentTarget;
  const parentEl = btn.parentElement;
  const label = parentEl.children[1];

  const type = label.getAttribute('type') === 'password' ? 'text' : 'password';
  label.setAttribute('type', type);
  // toggle the eye slash icon
  btn.classList.contains('fa-eye')
    ? btn.classList.toggle('fa-eye-slash')
    : btn.classList.toggle('fa-eye');
};

export { showPassword };
