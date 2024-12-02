import { MAX_HEIGHT, MAX_WIDTH, GAP } from '@constants/VIDEO';

import useWebRTCStore from '@stores/useWebRTCStore';
import Video from '@components/StudyRoom/Video';
import VideoOverlay from '@components/StudyRoom/VideoOverlay';

const VideoGrid = () => {
  const curParticipant = useWebRTCStore((state) => state.curParticipant);
  const localStream = useWebRTCStore((state) => state.localStream);
  const { webRTCMap } = useWebRTCStore.getState();

  const cols = Math.ceil(Math.sqrt(curParticipant));
  const rows = Math.ceil(curParticipant / cols);

  return (
    <section
      className="flex flex-wrap items-center justify-center"
      style={{
        height: `${(MAX_HEIGHT / cols) * rows + GAP * (rows - 1)}px`,
        width: `${MAX_WIDTH + GAP * (cols - 1)}px`,
        gap: `${GAP}px`,
      }}
    >
      <div
        className="relative rounded-2xl bg-black"
        style={{
          height: `${MAX_HEIGHT / cols}px`,
          width: `${MAX_WIDTH / cols}px`,
        }}
      >
        <Video mediaStream={localStream} muted={true} />
        <VideoOverlay nickName={localStorage.getItem('nickName')!} cols={cols} />
      </div>
      {Object.entries(webRTCMap).map(([id, { remoteStream, dataChannel, nickName }]) => (
        <div
          key={id}
          className="relative rounded-2xl bg-black"
          style={{
            height: `${MAX_HEIGHT / cols}px`,
            width: `${MAX_WIDTH / cols}px`,
          }}
        >
          <Video mediaStream={remoteStream} muted={false} />
          <VideoOverlay nickName={nickName} dataChannel={dataChannel} cols={cols} />
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
