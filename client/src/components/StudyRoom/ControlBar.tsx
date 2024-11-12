import Icon from '@components/common/Icon';

interface ControlBarProps {
  className?: string;
  toggleVideo: () => void;
  toggleMic: () => void;
  toggleChat: () => void;
  exitRoom: () => void;
}

const ControlBar = ({
  className,
  toggleVideo,
  toggleMic,
  toggleChat,
  exitRoom,
}: ControlBarProps) => {
  return (
    <div className={`flex gap-12 ${className}`}>
      <button
        onClick={toggleVideo}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon id="video" className="text-gomz-white h-5 w-5 fill-current"></Icon>
      </button>
      <button
        onClick={toggleMic}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon id="mic" className="text-gomz-white h-6 w-6 fill-current"></Icon>
      </button>
      <button
        onClick={toggleChat}
        className="bg-gomz-black flex h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon id="chat-off" className="text-gomz-white h-5 w-5 fill-current"></Icon>
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
