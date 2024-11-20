const StopWatch = ({ elapsedSeconds = 0 }: { elapsedSeconds: number }) => {
  const formatTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}`;
  };

  return <div className="tabular-nums">{formatTime()}</div>;
};

export default StopWatch;
