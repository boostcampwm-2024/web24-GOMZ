const getVideoDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'videoinput');
};

const getAudioDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === 'audioinput');
};

const createDummyTrack = () => {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const destination = audioContext.createMediaStreamDestination();

  gainNode.gain.value = 0;

  oscillator.connect(gainNode);
  gainNode.connect(destination);

  oscillator.start();

  return destination.stream.getAudioTracks()[0];
};

export { getVideoDevices, getAudioDevices, createDummyTrack };
