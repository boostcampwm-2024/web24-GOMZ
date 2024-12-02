import { useEffect, useRef } from 'react';

import type { Video as VideoProps } from '@customTypes/StudyRoom';

const Video = ({ mediaStream, muted }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleTrackEvent = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    };

    handleTrackEvent();
    mediaStream.addEventListener('addtrack', handleTrackEvent);
    mediaStream.addEventListener('removetrack', handleTrackEvent);

    return () => {
      mediaStream.removeEventListener('addtrack', handleTrackEvent);
      mediaStream.removeEventListener('removetrack', handleTrackEvent);
    };
  }, []);

  return (
    <video
      className="rounded-2xl"
      width="100%"
      height="100%"
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
    />
  );
};

export default Video;
