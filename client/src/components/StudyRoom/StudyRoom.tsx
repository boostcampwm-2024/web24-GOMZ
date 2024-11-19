import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signalingClient from '@socket/signalingClient';
import StudyRoomHeader from './StudyRoomHeader';
import VideoGrid from './VideoGrid';
import ControlBar from './ControlBar';
import { io } from 'socket.io-client';

type SocketId = string | undefined;

const StudyRoom = () => {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamMap = useRef<Map<SocketId, MediaStream>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const peerConnectionMap = useRef<Map<SocketId, RTCPeerConnection>>(new Map());
  const nickNameMap = useRef<Map<SocketId, string>>(new Map());
  const stopWatchMap = useRef<Map<SocketId, RTCDataChannel>>(new Map());
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });
  const socket = useRef(io());

  const toggleVideo = () => {
    localStream.current?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    return localStream.current!.getVideoTracks().every((track) => track.enabled);
  };

  const toggleMic = () => {
    localStream.current?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    return localStream.current!.getAudioTracks().every((track) => track.enabled);
  };

  const exitRoom = () => {
    peerConnectionMap.current.forEach((connection) => {
      connection.close();
    });

    localStream.current?.getTracks().forEach((track) => track.stop());
    socket.current.close();
    navigate('/');
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
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      toggleVideo();
      toggleMic();

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

      const { peerConnectionMap: temp, socket: temp2 } = signalingClient(
        localStream.current,
        remoteStreamMap.current,
        nickNameMap.current,
        stopWatchMap.current,
      );

      peerConnectionMap.current = temp;
      socket.current = temp2;
    };

    initStream();

    return () => exitRoom();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-between">
        <StudyRoomHeader
          className="mt-1"
          title="부스트 캠프 공부방"
          curParticipant={remoteStreamMap.current.size + 1}
          maxParticipant={16}
        />
        <VideoGrid
          localVideoRef={localVideoRef}
          remoteStreamMap={remoteStreamMap}
          nickNameMap={nickNameMap}
          grid={grid}
        />
        <ControlBar
          className="mb-10"
          toggleVideo={toggleVideo}
          toggleMic={toggleMic}
          toggleChat={() => {}}
          exitRoom={exitRoom}
        />
      </div>
    </div>
  );
};

export default StudyRoom;
