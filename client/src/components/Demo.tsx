import { useEffect, useRef, useState } from 'react';
import signalingClient from '@socket/signalingClient';

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

function Demo() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCMap = useRef(new Map<string, WebRTCData>());
  const localStreamRef = useRef(new MediaStream());
  const [, forceUpdate] = useState({});

  const openUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  const closeUserMedia = async () => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const initStream = async () => {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      openUserMedia();

      const observableMap = new Map();
      const set = observableMap.set.bind(observableMap);
      const del = observableMap.delete.bind(observableMap);

      observableMap.set = (key: string | undefined, value: MediaStream) => {
        set(key, value);
        forceUpdate({});
        return observableMap;
      };

      observableMap.delete = (key: string | undefined) => {
        const result = del(key);
        forceUpdate({});
        return result;
      };

      webRTCMap.current = observableMap;

      signalingClient(localStreamRef.current, webRTCMap.current);
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

          {[...webRTCMap.current].map(([id, { remoteStream }]) => (
            <div
              key={String(id)}
              style={{ border: '1px solid black', width: '480px', height: '360px' }}
            >
              <video
                ref={(element) => {
                  if (element) {
                    element.srcObject = remoteStream;
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
