const playSoundStart = () => {
  const audio = new Audio('../sound/mixkit-software-interface-start-2574.wav');
  audio.play();
};

const playSoundNotification = () => {
  const audio = new Audio('../sound/mixkit-long-pop-2358.wav');
  audio.play();
};

export { playSoundStart, playSoundNotification };
