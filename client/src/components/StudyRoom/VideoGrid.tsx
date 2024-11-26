import Video from '@components/StudyRoom/Video';
import VideoOverlay from '@components/StudyRoom/VideoOverlay';

const RATIO = 4 / 3;
const MAX_HEIGHT = 600;
const MAX_WIDTH = MAX_HEIGHT * RATIO;
const GAP = 8;

interface Grid {
  cols: number;
  rows: number;
}

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

interface VideoGridProps {
  localStream: MediaStream;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
  participantCount: number;
  grid: Grid;
}

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
        <Video
          mediaStream={localStream}
          nickName={localStorage.getItem('nickName')!}
          gridCols={grid.cols}
          muted={true}
        />
        <VideoOverlay nickName={localStorage.getItem('nickName')!} gridCols={grid.cols} />
      </div>
      {[...webRTCMap.current].map(([id, { remoteStream, dataChannel, nickName }]) => (
        <div
          className="relative rounded-2xl bg-black"
          style={{
            height: `${MAX_HEIGHT / grid.cols}px`,
            width: `${MAX_WIDTH / grid.cols}px`,
          }}
        >
          <Video
            key={id}
            mediaStream={remoteStream}
            dataChannel={dataChannel}
            nickName={nickName}
            gridCols={grid.cols}
            muted={false}
          />
          <VideoOverlay nickName={nickName} dataChannel={dataChannel} gridCols={grid.cols} />
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
