import { useNavigate } from 'react-router-dom';

import StudyRoomHeader from './StudyRoomHeader';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import useWebRTC from '@hooks/useWebRTC';

const StudyRoom = () => {
  const navigate = useNavigate();

  const [
    { localVideoRef, webRTCMap, participantCount, grid },
    { toggleVideo, toggleMic, exitRoom },
  ] = useWebRTC();

  const handleExit = () => {
    exitRoom();
    navigate(-1);
  };

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
        <StudyRoomHeader
          className="mt-1"
          title="부스트 캠프 공부방"
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
