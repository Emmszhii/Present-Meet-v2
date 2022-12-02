const playSoundStart = () => {
  const audio = new Audio('../sound/mixkit-software-interface-start-2574.wav');
  audio.muted = true;
  audio.play();
};

const playSoundNotification = () => {
  const audio = new Audio('../sound/mixkit-long-pop-2358.wav');
  audio.muted = true;
  audio.play();
};

const playSoundRaiseHand = () => {
  const audio = new Audio('../sound/simple_notification_3.mp3');
  audio.muted = true;
  audio.play();
};

export { playSoundStart, playSoundNotification, playSoundRaiseHand };
