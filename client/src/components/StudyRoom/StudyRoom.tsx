import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import StudyRoomHeader from '@components/StudyRoom/StudyRoomHeader';
import VideoGrid from '@components/StudyRoom/VideoGrid';
import ControlBar from '@components/StudyRoom/ControlBar';
import Chat from '@components/StudyRoom/Chat';
import useWebRTC from '@hooks/useWebRTC';

interface Message {
  nickName: string;
  message: string;
}

const StudyRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId')!;

  const [isChatOn, setIsChatOn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [
    { localVideoRef, webRTCMap, participantCount, grid },
    { toggleVideo, toggleMic, joinRoom, exitRoom, sendMessage },
  ] = useWebRTC();

  useEffect(() => {
    joinRoom(roomId).then((socket) => {
      socket.on('receiveMessage', ({ userId, message }) => {
        const { nickName } = webRTCMap.current.get(userId)!;
        setMessages((previousMessages) => [...previousMessages, { nickName, message }]);
      });
    });

    return () => exitRoom();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="relative flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
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
        {isChatOn && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            onClick={({ target, currentTarget }) => target === currentTarget && setIsChatOn(false)}
          >
            <Chat
              messages={messages}
              setMessages={setMessages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoom;
