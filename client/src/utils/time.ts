const secondsToHMS = (elapsedSeconds: number) => {
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return { hours, minutes, seconds };
};

const formatTime = (hours: number, minutes: number, seconds: number) => {
  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}`;
};

export { secondsToHMS, formatTime };
