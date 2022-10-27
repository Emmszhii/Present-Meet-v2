const getCameraDevices = async () => {
  if (!navigator.mediaDevices.enumerateDevices)
    return `This App don't support the kind of devices you are using`;

  const device = navigator.mediaDevices
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

const removeOptions = (selectElement) => {
  let i,
    L = selectElement.options.length - 1;
  for (i = L; i >= 0; i++) {
    selectElement.remove[i];
  }
};

export { getCameraDevices, removeOptions };
