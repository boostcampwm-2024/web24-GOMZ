import { useState, useEffect, useRef } from 'react';
import StopWatch from '@components/common/StopWatch';

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
  localVideoRef: React.RefObject<HTMLVideoElement>;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
  participantCount: number;
  grid: Grid;
}

const RemoteVideo = ({
  remoteStream,
  nickName,
  elapsedSeconds,
  gridCols,
}: {
  remoteStream: MediaStream;
  nickName: string;
  elapsedSeconds: number;
  gridCols: number;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }

    const handleTrackEvent = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    };

    remoteStream.addEventListener('addtrack', handleTrackEvent);
    remoteStream.addEventListener('removetrack', handleTrackEvent);

    return () => {
      remoteStream.removeEventListener('addtrack', handleTrackEvent);
      remoteStream.removeEventListener('removetrack', handleTrackEvent);
    };
  }, [remoteStream]);

  return (
    <div
      className="relative rounded-2xl bg-black"
      style={{
        height: `${MAX_HEIGHT / gridCols}px`,
        width: `${MAX_WIDTH / gridCols}px`,
      }}
    >
      <video
        className="rounded-2xl"
        width="100%"
        height="100%"
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
      />
      <div
        className="bg-gomz-black absolute left-0 top-full flex w-full items-center justify-between rounded-b-2xl text-white opacity-85"
        style={{
          height: `${Math.max(5 / Math.sqrt(gridCols), 2)}rem`,
          transform: `translateY(-${Math.max(5 / Math.sqrt(gridCols), 2)}rem)`,
          padding: `0 ${Math.max(3 / Math.sqrt(gridCols), 1)}rem`,
        }}
      >
        <div
          className="truncate font-normal"
          style={{
            fontSize: `${Math.max(1.75 / Math.sqrt(gridCols), 0.625)}rem`,
            maxWidth: `${MAX_WIDTH / gridCols / 2.5}px`,
          }}
        >
          {nickName}
        </div>
        <div
          className="truncate font-normal"
          style={{
            fontSize: `${Math.max(1.75 / Math.sqrt(gridCols), 0.625)}rem`,
          }}
        >
          <StopWatch elapsedSeconds={elapsedSeconds} />
        </div>
      </div>
    </div>
  );
};

const VideoGrid = ({ localVideoRef, webRTCMap, participantCount, grid }: VideoGridProps) => {
  const elapsedSecondsMap = useRef(new Map<string, number>());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    webRTCMap.current.forEach(({ dataChannel }, id) => {
      dataChannel.onmessage = ({ data }) => {
        const elapsedSeconds = Number(data);
        elapsedSecondsMap.current.set(id, elapsedSeconds);
        forceUpdate(elapsedSeconds);
      };
    });

    return () => {
      webRTCMap.current.forEach(({ dataChannel }, id) => {
        elapsedSecondsMap.current.delete(id);
        dataChannel.onmessage = () => {};
      });
    };
  }, [participantCount]);

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
        <video
          className="h-full w-full rounded-2xl"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
        />
        <div
          className="bg-gomz-black absolute left-0 top-full flex w-full items-center justify-between rounded-b-2xl text-white opacity-85"
          style={{
            height: `${Math.max(5 / Math.sqrt(grid.cols), 2)}rem`,
            transform: `translateY(-${Math.max(5 / Math.sqrt(grid.cols), 2)}rem)`,
            padding: `0 ${Math.max(3 / Math.sqrt(grid.cols), 1)}rem`,
          }}
        >
          <div
            className="truncate font-normal"
            style={{
              fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
              maxWidth: `${MAX_WIDTH / grid.cols / 2.5}px`,
            }}
          >
            {localStorage.getItem('nickName')}
          </div>
        </div>
      </div>
      {[...webRTCMap.current].map(([id, { remoteStream, nickName }]) => (
        <RemoteVideo
          key={id}
          remoteStream={remoteStream}
          nickName={nickName}
          elapsedSeconds={elapsedSecondsMap.current.get(id)!}
          gridCols={grid.cols}
        />
      ))}
    </section>
  );
};

export default VideoGrid;
