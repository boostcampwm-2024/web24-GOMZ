import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import StudyRoomHeader from '@components/StudyRoom/StudyRoomHeader';
import VideoGrid from '@components/StudyRoom/VideoGrid';
import ControlBar from '@components/StudyRoom/ControlBar';
import useWebRTC from '@hooks/useWebRTC';

const StudyRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId')!;

  const [
    { localVideoRef, webRTCMap, participantCount, grid },
    { toggleVideo, toggleMic, joinRoom, exitRoom },
  ] = useWebRTC();

  const handleExit = () => {
    exitRoom();
    navigate('/studyroomlist');
  };

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
          toggleChat={() => {}}
          exitRoom={handleExit}
        />
      </div>
    </div>
  );
};

export default StudyRoom;
