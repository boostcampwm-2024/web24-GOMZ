const getVideoDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'videoinput');
};

const getAudioDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'audioinput');
};

const createDummyStream = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const destination = audioContext.createMediaStreamDestination();

  gainNode.gain.value = 0;

  oscillator.connect(gainNode);
  gainNode.connect(destination);

  oscillator.start();

  return destination.stream;
};

const checkPermission = async (permissionName: string) => {
  return await navigator.permissions
    .query({
      name: permissionName as PermissionName,
    })
    .then((permissionStatus) => permissionStatus.state);
};

const requestPermission = async (cameraPermission: boolean, micPermission: boolean) => {
  if (cameraPermission || micPermission) {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: cameraPermission,
      audio: micPermission,
    });
    mediaStream.getTracks().forEach((track) => track.stop());
  }
};

export { getVideoDevices, getAudioDevices, createDummyStream, checkPermission, requestPermission };
