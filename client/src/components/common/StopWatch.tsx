import { useRef, useState, useEffect } from 'react';

interface StopWatchProps {
  isRunning: boolean;
}

const StopWatch = ({ isRunning }: StopWatchProps) => {
  const startTimeRef = useRef(0); // ms
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // s
  const [accumulatedTime, setAccumulatedTime] = useState(0); // ms

  useEffect(() => {
    let animationFrameId: number;

    const step = () => {
      const diffTime = Date.now() - startTimeRef.current;
      setElapsedSeconds(Math.floor(diffTime / 1000));
      animationFrameId = requestAnimationFrame(step);
    };

    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTime;
      animationFrameId = requestAnimationFrame(step);
    } else {
      setAccumulatedTime(startTimeRef.current ? Date.now() - startTimeRef.current : 0);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning]);

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
