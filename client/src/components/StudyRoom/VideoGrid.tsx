import { useEffect, useRef, useState } from 'react';
import signalingClient from '@socket/signalingClient';

const RATIO = 4 / 3;
const MAX_HEIGHT = 600;
const MAX_WIDTH = MAX_HEIGHT * RATIO;

const VideoGrid = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamMap = useRef<Map<string | undefined, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const [cols, setCols] = useState(1);
  // const [, forceUpdate] = useState({});

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
    const newCols = Math.ceil(Math.sqrt(remoteStreamMap.current.size + 1));
    setCols(newCols);
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
        // forceUpdate({});
        return observableMap;
      };

      observableMap.delete = (key: string | undefined) => {
        const result = del(key);
        calculateGrid();
        // forceUpdate({});
        return result;
      };

      remoteStreamMap.current = observableMap;

      signalingClient(localStream.current, remoteStreamMap.current);
    };

    initStream();
  }, []);

  return (
    // <section className="flex flex-wrap justify-center gap-1">
    <section
      className={`grid`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${cols}, 1fr)`,
      }}
    >
      <div
        className={`border-gomz-black rounded-2xl border bg-white`}
        style={{
          height: `${MAX_HEIGHT / cols}px`,
          width: `${MAX_WIDTH / cols}px`,
        }}
      >
        <video
          className="rounded-2xl"
          width={MAX_WIDTH / cols}
          height={MAX_HEIGHT / cols}
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
            height: `${MAX_HEIGHT / cols}px`,
            width: `${MAX_WIDTH / cols}px`,
          }}
        >
          <video
            className="rounded-2xl"
            width={MAX_WIDTH / cols}
            height={MAX_HEIGHT / cols}
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
