import type { StopWatch as StopWatchProps } from '@customTypes/Common';

import { secondsToHMS, formatTime } from '@utils/time';

const StopWatch = ({ elapsedSeconds = 0, isAnimationOn }: StopWatchProps) => {
  const { hours, minutes, seconds } = secondsToHMS(elapsedSeconds);

  return (
    <>
      {isAnimationOn ? (
        <div className="flex items-center gap-2 tabular-nums">
          <div className="flex">
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${10 * Math.floor(hours / 10)}%)` }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${10 * (hours % 10)}%)` }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </div>
          <span>:</span>
          <div className="flex">
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${(100 / 6) * Math.floor(minutes / 10)}%)` }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${10 * (minutes % 10)}%)` }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </div>
          <span>:</span>
          <div className="flex">
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${(100 / 6) * Math.floor(seconds / 10)}%)` }}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="relative h-[1.75rem] w-[1.0ch] overflow-hidden">
              <ul
                className="absolute transition-transform duration-700"
                style={{ transform: `translateY(-${10 * (seconds % 10)}%)` }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="tabular-nums">{formatTime(hours, minutes, seconds)}</div>
      )}
    </>
  );
};

export default StopWatch;
