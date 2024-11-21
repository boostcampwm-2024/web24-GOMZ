import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import StudyRoomHeader from '@components/StudyRoom/StudyRoomHeader';
import VideoGrid from '@components/StudyRoom/VideoGrid';
import ControlBar from '@components/StudyRoom/ControlBar';
import Chat from '@components/StudyRoom/Chat';
import useWebRTC from '@hooks/useWebRTC';

const StudyRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId')!;

  const [isChatOn, setIsChatOn] = useState(false);

  const [
    { localVideoRef, webRTCMap, participantCount, grid },
    { toggleVideo, toggleMic, joinRoom, exitRoom, sendMessage },
  ] = useWebRTC();

  useEffect(() => {
    joinRoom(roomId);
    return () => exitRoom();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
        <StudyRoomHeader
          className="mt-1"
          roomName="부스트 캠프 공부방"
          curParticipant={participantCount}
          maxParticipant={16}
          webRTCMap={webRTCMap}
        />
        <VideoGrid
          localVideoRef={localVideoRef}
          webRTCMap={webRTCMap}
          participantCount={participantCount}
          grid={grid}
        />
        <ControlBar
          className="mb-10"
          toggleVideo={toggleVideo}
          toggleMic={toggleMic}
          toggleChat={() => {
            setIsChatOn(!isChatOn);
          }}
          exitRoom={() => navigate('/studyroomlist')}
          isChatOn={isChatOn}
        />
      </div>
      {isChatOn && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={({ target, currentTarget }) => target === currentTarget && setIsChatOn(false)}
        >
          <Chat sendMessage={sendMessage} className="-translate-y-44" />
        </div>
      )}
    </div>
  );
};

export default StudyRoom;
