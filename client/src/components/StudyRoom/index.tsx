import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import type { ChatMessage } from '@customTypes/StudyRoom';

import useWebRTCStore from '@stores/useWebRTCStore';
import Header from '@components/StudyRoom/Header';
import VideoGrid from '@components/StudyRoom/VideoGrid';
import ControlBar from '@components/StudyRoom/ControlBar';
import Chat from '@components/StudyRoom/Chat';

const StudyRoom = () => {
  const { state } = useLocation();
  const { roomId } = useParams();

  const [isChatOn, setIsChatOn] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastReadMessageIndex, setLastReadMessageIndex] = useState(-1);

  const { joinRoom, closeAllConnections } = useWebRTCStore.getState();

  useEffect(() => {
    if (!roomId) return;
    joinRoom(roomId);

    const { socket } = useWebRTCStore.getState();
    socket!.on('receiveMessage', ({ userId, message }) => {
      const { webRTCMap } = useWebRTCStore.getState();
      const { nickName } = webRTCMap[userId];
      setMessages((previousMessages) => [...previousMessages, { nickName, message }]);
    });

    return () => closeAllConnections();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="relative flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
        <Header className="mt-1" roomName={state.roomName} maxParticipant={state.maxParticipant} />
        <VideoGrid />
        <ControlBar
          className="mb-10"
          toggleChat={() => setIsChatOn(!isChatOn)}
          isChatOn={isChatOn}
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
              setLastReadMessageIndex={setLastReadMessageIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyRoom;
