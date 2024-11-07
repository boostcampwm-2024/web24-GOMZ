import { useEffect, useRef, useState } from 'react';
import signalingClient from '@/socket/signalingClient';

function Demo() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamMap = useRef<Map<string | undefined, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const [, forceUpdate] = useState({});

  const openUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }
  };

  const closeUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
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

      observableMap.set = (key: string | undefined, value: MediaStream) => {
        set(key, value);
        forceUpdate({});
        return observableMap;
      };

      remoteStreamMap.current = observableMap;

      signalingClient(localStream.current, remoteStreamMap.current);
    };

    initStream();
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img width="300" src="images/gomz-logo.png" alt="노트북을 보고 있는 곰 로고" />
      </div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h1>🐻 GOMZ DEMO 🔨</h1>
        <button style={{ width: '100px', height: '30px' }} onClick={openUserMedia}>
          송출
        </button>
        <button style={{ width: '100px', height: '30px' }} onClick={closeUserMedia}>
          송출 중단
        </button>
      </div>

      <section>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ border: '1px solid black', width: '480px', height: '360px' }}>
            <video width={480} height={360} ref={localVideoRef} autoPlay playsInline />
          </div>

          {[...remoteStreamMap.current].map(([id, stream]) => (
            <div
              key={String(id)}
              style={{ border: '1px solid black', width: '480px', height: '360px' }}
            >
              <video
                ref={(element) => {
                  if (element) {
                    element.srcObject = stream;
                  }
                }}
                autoPlay
                playsInline
                width={480}
                height={360}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Demo;
