import { useEffect, useRef, useState } from 'react';
import signalingClient from '@socket/signalingClient';

const RATIO = 4 / 3;
const MAX_HEIGHT = 600;
const MAX_WIDTH = MAX_HEIGHT * RATIO;
const GAP = 8;

const VideoGrid = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamMap = useRef<Map<string | undefined, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });

  const openUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
  };

  // const closeUserMedia = async () => {
  //   if (localVideoRef.current) {
  //     localVideoRef.current.srcObject = null;
  //   }
  // };

  const calculateGrid = () => {
    const totalVideos = remoteStreamMap.current.size + 1;
    const cols = Math.ceil(Math.sqrt(totalVideos));
    const rows = Math.ceil(totalVideos / cols);
    setGrid({ cols, rows });
  };

  useEffect(() => {
    const initStream = async () => {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      openUserMedia();

      const observableMap = new Map();
      const set = observableMap.set.bind(observableMap);
      const del = observableMap.delete.bind(observableMap);

      observableMap.set = (key: string | undefined, value: MediaStream) => {
        set(key, value);
        calculateGrid();
        return observableMap;
      };

      observableMap.delete = (key: string | undefined) => {
        const result = del(key);
        calculateGrid();
        return result;
      };

      remoteStreamMap.current = observableMap;

      signalingClient(localStream.current, remoteStreamMap.current);
    };

    initStream();
  }, []);

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
        className={`border-gomz-black rounded-2xl border bg-white`}
        style={{
          height: `${MAX_HEIGHT / grid.cols}px`,
          width: `${MAX_WIDTH / grid.cols}px`,
        }}
      >
        <video
          className="rounded-2xl"
          width="100%"
          height="100%"
          ref={localVideoRef}
          autoPlay
          playsInline
        />
      </div>
      {[...remoteStreamMap.current].map(([id, stream]) => (
        <div
          key={String(id)}
          className={`border-gomz-black rounded-2xl border bg-white`}
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
                element.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
          />
        </div>
      ))}
    </section>
  );
};
export default VideoGrid;
