import { useState, useEffect } from 'react';

import type { Header as StudyRoomHeaderProps } from '@customTypes/StudyRoom';

import Header from '@components/common/Header';
import Icon from '@components/common/Icon';
import StopWatch from '@components/common/StopWatch';
import useStopWatch from '@hooks/useStopWatch';

const StudyRoomHeader = ({
  className,
  roomName,
  curParticipant,
  maxParticipant,
  webRTCMap,
}: StudyRoomHeaderProps) => {
  const [isStopWatchRunning, setIsStopWatchRunning] = useState(false);
  const elapsedSeconds = useStopWatch(isStopWatchRunning);

  useEffect(() => {
    localStorage.setItem('studyTime', elapsedSeconds.toString());
    webRTCMap.current.forEach(({ dataChannel }) => {
      dataChannel.send(elapsedSeconds.toString());
    });
  }, [elapsedSeconds]);

  return (
    <Header
      className={className}
      title={
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold">{roomName}</h1>
          <span className="text-gomz-gray-800 font-normal">
            {curParticipant} / {maxParticipant}
          </span>
        </div>
      }
      stopWatch={
        <div className="flex translate-x-[1.125rem] gap-3 text-xl font-normal">
          <StopWatch elapsedSeconds={elapsedSeconds} isAnimationOn={true} />
          <button
            className="transition-transform hover:scale-105"
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
