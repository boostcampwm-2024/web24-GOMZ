import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ControlBar as ControlBarProps } from '@customTypes/StudyRoom';

import { getVideoDevices, getAudioDevices } from '@utils/media';

import useWebRTCStore from '@stores/useWebRTCStore';
import Icon from '@components/common/Icon';
import MediaSelectModal from '@components/StudyRoom/MediaSelectModal';

const ControlBar = ({ className, isChatOn, unreadMessagesCount, toggleChat }: ControlBarProps) => {
  const navigate = useNavigate();

  const [isVideoSelectModalOpen, setIsVideoSelectModalOpen] = useState(false);
  const [isAudioSelectModalOpen, setIsAudioSelectModalOpen] = useState(false);

  const { toggleVideo, toggleAudio, setVideoDeviceId, setAudioDeviceId } =
    useWebRTCStore.getState();
  const isVideoOn = useWebRTCStore((state) => state.isVideoOn);
  const isAudioOn = useWebRTCStore((state) => state.isAudioOn);
  const videoDeviceId = useWebRTCStore((state) => state.videoDeviceId);
  const audioDeviceId = useWebRTCStore((state) => state.audioDeviceId);

  return (
    <div className={`relative flex gap-10 ${className}`}>
      <div className="bg-gomz-gray-300 flex h-10 w-20 items-center rounded-full">
        <button
          className="bg-gomz-black flex h-10 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
          onClick={toggleVideo}
        >
          <Icon
            id={isVideoOn ? 'video' : 'video-off'}
            className="text-gomz-white h-5 w-5 fill-current"
          />
        </button>
        <button
          className="flex h-10 w-6 items-center justify-center rounded-full"
          onClick={() => setIsVideoSelectModalOpen(!isVideoSelectModalOpen)}
        >
          <Icon id="chevron" className="h-5 w-5 rotate-90" />
        </button>
      </div>
      <div className="bg-gomz-gray-300 flex h-10 w-20 items-center rounded-full">
        <button
          className="bg-gomz-black flex h-10 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
          onClick={toggleAudio}
        >
          <Icon
            id={isAudioOn ? 'mic' : 'mic-off'}
            className="text-gomz-white h-6 w-6 fill-current"
          />
        </button>
        <button
          className="flex h-10 w-6 items-center justify-center rounded-full"
          onClick={() => setIsAudioSelectModalOpen(!isAudioSelectModalOpen)}
        >
          <Icon id="chevron" className="h-5 w-5 rotate-90" />
        </button>
      </div>
      <button
        onClick={toggleChat}
        className="bg-gomz-black relative flex h-10 w-20 items-center rounded-full transition-transform hover:scale-105"
      >
        <div className="flex h-10 w-12 items-center justify-center rounded-full">
          <Icon
            id={isChatOn ? 'chat' : 'chat-off'}
            className="text-gomz-white h-5 w-5 fill-current"
          />
        </div>
        <div className="text-gomz-white absolute left-11 flex h-5 w-5 items-center justify-center rounded-full text-sm">
          {unreadMessagesCount}
        </div>
      </button>
      <button
        onClick={() => navigate('/study-room-list')}
        className="bg-gomz-red flex h-10 w-20 items-center justify-center rounded-full transition-transform hover:scale-105"
      >
        <Icon id="call-end" className="text-gomz-white h-7 w-7 fill-current" />
      </button>
      {isVideoSelectModalOpen && (
        <MediaSelectModal
          className="absolute bottom-0 -translate-y-14 translate-x-10"
          mediaDeviceId={videoDeviceId}
          setMediaDeviceId={setVideoDeviceId}
          getMediaDevices={getVideoDevices}
        />
      )}
      {isAudioSelectModalOpen && (
        <MediaSelectModal
          className="absolute bottom-0 -translate-y-14 translate-x-40"
          mediaDeviceId={audioDeviceId}
          setMediaDeviceId={setAudioDeviceId}
          getMediaDevices={getAudioDevices}
        />
      )}
    </div>
  );
};

export default ControlBar;
