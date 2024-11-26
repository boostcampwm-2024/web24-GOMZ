import { useEffect, useRef } from 'react';

interface VideoProps {
  mediaStream: MediaStream;
  dataChannel?: RTCDataChannel;
  nickName: string;
  gridCols: number;
  muted: boolean;
}

const Video = ({ mediaStream, muted }: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!mediaStream.active) return;

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
  }, [mediaStream]);

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
