import { useState } from 'react';
import Icon from '@components/common/Icon';

interface ControlBarProps {
  className?: string;
  toggleVideo: () => boolean;
  toggleMic: () => boolean;
  toggleChat: () => void;
  exitRoom: () => void;
  isChatOn: boolean;
}

const ControlBar = ({
  className,
  toggleVideo,
  toggleMic,
  toggleChat,
  exitRoom,
  isChatOn,
}: ControlBarProps) => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  return (
    <div className={`flex gap-12 ${className}`}>
      <button
        onClick={() => setIsVideoOn(toggleVideo())}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon
          id={isVideoOn ? 'video' : 'video-off'}
          className="text-gomz-white h-5 w-5 fill-current"
        ></Icon>
      </button>
      <button
        onClick={() => setIsMicOn(toggleMic())}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon
          id={isMicOn ? 'mic' : 'mic-off'}
          className="text-gomz-white h-6 w-6 fill-current"
        ></Icon>
      </button>
      <button
        onClick={toggleChat}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon
          id={isChatOn ? 'chat' : 'chat-off'}
          className="text-gomz-white h-5 w-5 fill-current"
        ></Icon>
      </button>
      <button
        onClick={exitRoom}
        className="bg-gomz-red flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon id="call-end" className="text-gomz-white h-7 w-7 fill-current"></Icon>
      </button>
    </div>
  );
};

export default ControlBar;
