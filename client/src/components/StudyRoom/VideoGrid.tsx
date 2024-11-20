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
  grid: Grid;
}

const VideoGrid = ({ localVideoRef, webRTCMap, grid }: VideoGridProps) => {
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
  }, [grid.cols, grid.rows]);

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
        className="relative rounded-2xl border border-black bg-black"
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
      {[...webRTCMap.current].map(([id, { remoteStream }]) => (
        <div
          key={String(id)}
          className="relative rounded-2xl border border-black bg-black"
          style={{
            height: `${MAX_HEIGHT / grid.cols}px`,
            width: `${MAX_WIDTH / grid.cols}px`,
          }}
        >
          <video
            className="rounded-2xl"
            width="100%"
            height="100%"
            ref={(element) => {
              if (element) {
                element.srcObject = remoteStream;
              }
            }}
            autoPlay
            playsInline
            muted={false}
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
              {webRTCMap.current.get(id)!.nickName}
            </div>
            <div
              className="truncate font-normal"
              style={{
                fontSize: `${Math.max(1.75 / Math.sqrt(grid.cols), 0.625)}rem`,
              }}
            >
              <StopWatch elapsedSeconds={elapsedSecondsMap.current.get(id)!} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default VideoGrid;
