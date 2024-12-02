import { useEffect, useState } from 'react';

import type { VideoOverlay as VideoOverlayProps } from '@customTypes/StudyRoom';
import { MAX_WIDTH } from '@constants/VIDEO';

import StopWatch from '@components/common/StopWatch';

const VideoOverlay = ({ nickName, dataChannel, gridCols }: VideoOverlayProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!dataChannel) return;

    const handleMessage = ({ data }: { data: string }) => {
      setElapsedSeconds(Number(data));
    };

    dataChannel.addEventListener('message', handleMessage);

    return () => {
      if (!dataChannel) return;
      dataChannel.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div
      className="bg-gomz-black absolute left-0 top-full flex w-full items-center justify-between truncate rounded-b-2xl font-normal text-white opacity-85"
      style={{
        height: `${Math.max(5 / Math.sqrt(gridCols), 2)}rem`,
        transform: `translateY(-${Math.max(5 / Math.sqrt(gridCols), 2)}rem)`,
        padding: `0 ${Math.max(3 / Math.sqrt(gridCols), 1)}rem`,
      }}
    >
      <div
        className="truncate"
        style={{
          fontSize: `${Math.max(1.75 / Math.sqrt(gridCols), 0.625)}rem`,
          maxWidth: `${MAX_WIDTH / gridCols / 2.5}px`,
        }}
      >
        {nickName}
      </div>
      <div
        style={{
          fontSize: `${Math.max(1.75 / Math.sqrt(gridCols), 0.625)}rem`,
        }}
      >
        {dataChannel && <StopWatch elapsedSeconds={elapsedSeconds} isAnimationOn={false} />}
      </div>
    </div>
  );
};

export default VideoOverlay;
