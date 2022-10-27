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

export { getCameraDevices };
