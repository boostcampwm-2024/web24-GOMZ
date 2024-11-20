import { useState, useRef, useEffect } from 'react';

const useStopWatch = (isRunning: boolean) => {
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

  return elapsedSeconds;
};

export default useStopWatch;
