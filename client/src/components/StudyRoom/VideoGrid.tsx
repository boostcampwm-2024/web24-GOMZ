import { useEffect, useRef } from 'react';

const VideoGrid = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);

  const openUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
  };

  useEffect(() => {
    const initStream = async () => {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      openUserMedia();
    };

    initStream();
  }, []);

  return (
    <section className="flex flex-wrap justify-center gap-1">
      <div className="border-gomz-black h-[22.5rem] w-[30rem] rounded-2xl border bg-white">
        <video
          className="rounded-2xl"
          width={480}
          height={360}
          ref={localVideoRef}
          autoPlay
          playsInline
        />
      </div>
    </section>
  );
};
export default VideoGrid;
