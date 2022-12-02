const tryCatchDeviceErr = (errorMessage) => {
  const arrErr = [
    {
      err: 'AgoraRTCError PERMISSION_DENIED: NotAllowedError: Permission denied',
      msg: `Permission to share user audio, video, stream are denied by user. User may not able to stream their audio, video, and stream`,
    },
    {
      err: `AgoraRTCError NOT_READABLE: NotReadableError: Could not start video source`,
      msg: `Device might not be recognized or it is in used by other application`,
    },
  ];
  return arrErr.filter((arr) => {
    if (errorMessage === arr.err) return arr;
  });
};

export { tryCatchDeviceErr };
