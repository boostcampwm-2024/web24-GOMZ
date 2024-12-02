import type { VideoGrid as VideoGridProps } from '@customTypes/StudyRoom';
import { MAX_HEIGHT, MAX_WIDTH, GAP } from '@constants/VIDEO';

import Video from '@components/StudyRoom/Video';
import VideoOverlay from '@components/StudyRoom/VideoOverlay';

const VideoGrid = ({ localStream, webRTCMap, grid }: VideoGridProps) => {
  return (
    <section
      className="flex flex-wrap items-center justify-center"
      style={{
        height: `${(MAX_HEIGHT / grid.cols) * grid.rows + GAP * (grid.rows - 1)}px`,
        width: `${MAX_WIDTH + GAP * (grid.cols - 1)}px`,
        gap: `${GAP}px`,
      }}
    >
      <div
        className="relative rounded-2xl bg-black"
        style={{
          height: `${MAX_HEIGHT / grid.cols}px`,
          width: `${MAX_WIDTH / grid.cols}px`,
        }}
      >
        <Video mediaStream={localStream} muted={true} />
        <VideoOverlay nickName={localStorage.getItem('nickName')!} gridCols={grid.cols} />
      </div>
      {[...webRTCMap.current].map(([id, { remoteStream, dataChannel, nickName }]) => (
        <div
          key={id}
          className="relative rounded-2xl bg-black"
          style={{
            height: `${MAX_HEIGHT / grid.cols}px`,
            width: `${MAX_WIDTH / grid.cols}px`,
          }}
        >
          <Video mediaStream={remoteStream} muted={false} />
          <VideoOverlay nickName={nickName} dataChannel={dataChannel} gridCols={grid.cols} />
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
