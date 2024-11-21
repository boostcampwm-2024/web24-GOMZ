import { useState, useEffect } from 'react';
import Header from '@components/common/Header';
import Icon from '@components/common/Icon';
import StopWatch from '@components/common/StopWatch';
import useStopWatch from '@hooks/useStopWatch';

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

interface StudyRoomHeaderProps {
  className?: string;
  roomName: string;
  curParticipant: number;
  maxParticipant: number;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
}

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
          <StopWatch elapsedSeconds={elapsedSeconds} />
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
