import { useEffect, useRef, useState } from 'react';
import signalingClient from '@socket/signalingClient';
import StudyRoomHeader from './StudyRoomHeader';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';

type SocketId = string | undefined;

const StudyRoom = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamMap = useRef<Map<SocketId, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const peerConnectionMap = useRef<Map<SocketId, RTCPeerConnection>>(new Map());
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });

  const toggleUserMedia = async () => {
    localStream.current?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  };

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

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      toggleUserMedia();

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

      peerConnectionMap.current = signalingClient(localStream.current, remoteStreamMap.current);
    };

    initStream();
  }, []);

  return (
    <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
      <StudyRoomHeader
        className="mt-1"
        title="부스트 캠프 공부방"
        curParticipant={remoteStreamMap.current.size + 1}
        maxParticipant={16}
        timer="01 : 49 : 29"
      />
      <VideoGrid localVideoRef={localVideoRef} remoteStreamMap={remoteStreamMap} grid={grid} />
      <ControlBar
        className="mb-10"
        toggleVideo={toggleUserMedia}
        toggleMic={() => {}}
        toggleChat={() => {}}
        exitRoom={() => {}}
      />
    </div>
  );
};

export default StudyRoom;
