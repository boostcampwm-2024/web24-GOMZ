import StudyRoomHeader from './StudyRoomHeader';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';

const StudyRoom = () => {
  return (
    <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
      <StudyRoomHeader
        className="mt-1"
        title="부스트 캠프 공부방"
        curParticipant={6}
        maxParticipant={10}
        timer="01 : 49 : 29"
      />
      <VideoGrid />
      <ControlBar
        className="mb-10"
        toggleVideo={() => {}}
        toggleMic={() => {}}
        toggleChat={() => {}}
        exitRoom={() => {}}
      />
    </div>
  );
};

export default StudyRoom;
