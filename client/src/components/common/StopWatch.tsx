import { useState, useEffect } from 'react';

interface StopWatchProps {
  isRunning: boolean;
}

const StopWatch = ({ isRunning }: StopWatchProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}`;
  };

  return <div className="tabular-nums">{formatTime()}</div>;
};

export default StopWatch;
