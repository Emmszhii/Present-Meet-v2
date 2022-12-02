const getCameraDevices = async () => {
  if (!navigator.mediaDevices.enumerateDevices)
    return `This App don't support the kind of devices you are using`;

  const device = await navigator.mediaDevices
    .enumerateDevices()
    .then((device) => {
      const cameraDevice = [];

      for (const [index, camera] of device.entries()) {
        if (camera.kind === 'videoinput') cameraDevice.push(camera);
      }

      return cameraDevice;
    })
    .catch((err) => {
      console.log(err);
      return err.message;
    });

  return device;
};

const allVideoAndAudioDevices = async () => {
  if (!navigator.mediaDevices.enumerateDevices)
    return { err: `This App don't support the kind of devices you are using` };

  try {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    if (!allDevices) return;

    const filterDevices = [];
    const audioDevices = [];
    const videoDevices = [];
    allDevices.map((item) => {
      if (item.deviceId !== 'communications' && item.deviceId !== 'default')
        filterDevices.push(item);
    });

    filterDevices.forEach((item) => {
      if (item.kind === 'audioinput') audioDevices.push(item);
      if (item.kind === 'videoinput') videoDevices.push(item);
    });

    const devices = { audioDevices, videoDevices };
    return devices;
  } catch (e) {
    console.log(e);
  }
};

const removeOptions = (selectElement) => {
  let i,
    L = selectElement.options.length - 1;
  for (i = L; i >= 0; i++) {
    selectElement.remove[i];
  }
};

export { allVideoAndAudioDevices, getCameraDevices, removeOptions };
