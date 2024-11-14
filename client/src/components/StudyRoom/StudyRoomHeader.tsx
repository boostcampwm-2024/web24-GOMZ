import { useState } from 'react';
import Header from '@components/common/Header';
import Icon from '@components/common/Icon';
import StopWatch from '@components/common/StopWatch';

interface StudyRoomHeaderProps {
  className?: string;
  title: string;
  curParticipant: number;
  maxParticipant: number;
}

const StudyRoomHeader = ({
  className,
  title,
  curParticipant,
  maxParticipant,
}: StudyRoomHeaderProps) => {
  const [isStopWatchRunning, setIsStopWatchRunning] = useState(false);

  return (
    <Header
      className={className}
      title={
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold">{title}</h1>
          <span className="text-gomz-gray-800 font-normal">
            {curParticipant} / {maxParticipant}
          </span>
        </div>
      }
      stopWatch={
        <div className="flex translate-x-[1.125rem] gap-3 text-xl font-normal">
          <StopWatch isRunning={isStopWatchRunning} />
          <button
            onClick={() => {
              setIsStopWatchRunning(!isStopWatchRunning);
            }}
          >
            <Icon id={isStopWatchRunning ? 'pause' : 'play'} className="h-6 w-6"></Icon>
          </button>
        </div>
      }
      userInfo={<div></div>}
    />
  );
};

export default StudyRoomHeader;
