import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

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
  const { state } = useLocation();
  const { roomId } = useParams();

  const [isChatOn, setIsChatOn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);

  const [
    {
      localStream,
      webRTCMap,
      participantCount,
      grid,
      selectedVideoDeviceId,
      selectedAudioDeviceId,
    },
    {
      toggleVideo,
      toggleMic,
      joinRoom,
      exitRoom,
      sendMessage,
      getVideoDevices,
      getAudioDevices,
      setSelectedVideoDeviceId,
      setSelectedAudioDeviceId,
    },
  ] = useWebRTC();

  useEffect(() => {
    if (!roomId) return;
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
          roomName={state.roomName}
          curParticipant={participantCount}
          maxParticipant={state.maxParticipant}
          webRTCMap={webRTCMap}
        />
        <VideoGrid localStream={localStream} webRTCMap={webRTCMap} grid={grid} />
        <ControlBar
          className="mb-10"
          toggleVideo={toggleVideo}
          toggleMic={toggleMic}
          toggleChat={() => setIsChatOn(!isChatOn)}
          exitRoom={() => navigate('/study-room-list')}
          isChatOn={isChatOn}
          getVideoDevices={getVideoDevices}
          getAudioDevices={getAudioDevices}
          selectedVideoDeviceId={selectedVideoDeviceId}
          selectedAudioDeviceId={selectedAudioDeviceId}
          setSelectedVideoDeviceId={setSelectedVideoDeviceId}
          setSelectedAudioDeviceId={setSelectedAudioDeviceId}
          unreadMessagesCount={messages.length - lastReadMessageIndex - 1}
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
              setLastReadMessageIndex={setLastReadMessageIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoom;
