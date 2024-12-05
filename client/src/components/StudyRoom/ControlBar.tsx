import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CircleX } from 'lucide-react';

import type { ControlBar as ControlBarProps } from '@customTypes/StudyRoom';

import { getVideoDevices, getAudioDevices, checkPermission, requestPermission } from '@utils/media';

import useWebRTCStore from '@stores/useWebRTCStore';
import Icon from '@components/common/Icon';
import MediaSelectModal from '@components/StudyRoom/MediaSelectModal';

const PermissionIcon = ({ className, permission }: { className: string; permission: string }) => {
  if (permission === 'prompt') {
    return <AlertCircle className={`h-5 w-5 rounded-full bg-white text-amber-500 ${className}`} />;
  }
  if (permission === 'denied') {
    return <CircleX className={`h-5 w-5 rounded-full bg-white text-red-500 ${className}`} />;
  }
  return null;
};

const ControlBar = ({ className, isChatOn, unreadMessagesCount, toggleChat }: ControlBarProps) => {
  const navigate = useNavigate();

  const [isVideoSelectModalOpen, setIsVideoSelectModalOpen] = useState(false);
  const [isAudioSelectModalOpen, setIsAudioSelectModalOpen] = useState(false);

  const {
    toggleVideo,
    toggleAudio,
    startAudio,
    setVideoDeviceId,
    setAudioDeviceId,
    setVideoPermission,
    setAudioPermission,
  } = useWebRTCStore.getState();
  const isVideoOn = useWebRTCStore((state) => state.isVideoOn);
  const isAudioOn = useWebRTCStore((state) => state.isAudioOn);
  const videoDeviceId = useWebRTCStore((state) => state.videoDeviceId);
  const audioDeviceId = useWebRTCStore((state) => state.audioDeviceId);
  const videoPermission = useWebRTCStore((state) => state.videoPermission);
  const audioPermission = useWebRTCStore((state) => state.audioPermission);

  const handleToggleVideo = async () => {
    if (videoPermission === 'granted') {
      toggleVideo();
    } else if (videoPermission === 'prompt') {
      try {
        await requestPermission(true, false);
        setVideoPermission('granted');
        toggleVideo();
      } catch {
        const permissionState = await checkPermission('camera');
        setVideoPermission(permissionState);
      }
    }
  };

  const handleToggleAudio = async () => {
    if (audioPermission === 'granted') {
      toggleAudio();
    } else if (audioPermission === 'prompt') {
      try {
        await requestPermission(false, true);
        setAudioPermission('granted');
        startAudio();
      } catch {
        const permissionState = await checkPermission('microphone');
        setAudioPermission(permissionState);
      }
    }
  };

  return (
    <div className={`relative flex gap-10 ${className}`}>
      <div className="bg-gomz-gray-300 flex h-10 w-20 items-center rounded-full">
        <button
          className="bg-gomz-black relative flex h-10 w-12 items-center justify-center rounded-full transition-transform hover:enabled:scale-105"
          onClick={handleToggleVideo}
          disabled={videoPermission === 'denied' ? true : false}
        >
          <Icon
            id={isVideoOn ? 'video' : 'video-off'}
            className="text-gomz-white h-5 w-5 fill-current"
          />
          <PermissionIcon className="absolute -right-1 -top-1" permission={videoPermission} />
        </button>
        <button
          className="flex h-10 w-6 items-center justify-center rounded-full"
          onClick={() => setIsVideoSelectModalOpen(!isVideoSelectModalOpen)}
          disabled={videoPermission === 'granted' ? false : true}
        >
          <Icon id="chevron" className="h-5 w-5 rotate-90" />
        </button>
      </div>
      <div className="bg-gomz-gray-300 flex h-10 w-20 items-center rounded-full">
        <button
          className="bg-gomz-black relative flex h-10 w-12 items-center justify-center rounded-full transition-transform hover:enabled:scale-105"
          onClick={handleToggleAudio}
          disabled={audioPermission === 'denied' ? true : false}
        >
          <Icon
            id={isAudioOn ? 'mic' : 'mic-off'}
            className="text-gomz-white h-6 w-6 fill-current"
          />
          <PermissionIcon className="absolute -right-1 -top-1" permission={audioPermission} />
        </button>
        <button
          className="flex h-10 w-6 items-center justify-center rounded-full"
          onClick={() => setIsAudioSelectModalOpen(!isAudioSelectModalOpen)}
          disabled={audioPermission === 'granted' ? false : true}
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
