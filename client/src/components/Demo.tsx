import { useEffect, useRef } from 'react';

function Demo() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);

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

          <div style={{ border: '1px solid black', width: '480px', height: '360px' }}>
            <video width={480} height={360} autoPlay playsInline />
          </div>

          <div style={{ border: '1px solid black', width: '480px', height: '360px' }}>
            <video width={480} height={360} autoPlay playsInline />
          </div>
        </div>
      </section>
    </>
  );
}

export default Demo;
