import { useState, useRef } from 'react';
import { io } from 'socket.io-client';
import signalingClient from '@socket/signalingClient';

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

interface WebRTCState {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
  participantCount: number;
  grid: { cols: number; rows: number };
}

interface WebRTCControls {
  toggleVideo: () => boolean;
  toggleMic: () => boolean;
  joinRoom: (roomId: string) => void;
  exitRoom: () => void;
  sendMessage: (message: string) => void;
}

const useWebRTC = (): [WebRTCState, WebRTCControls] => {
  const socket = useRef(io());
  const webRTCMap = useRef(new Map<string, WebRTCData>());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef(new MediaStream());
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });
  const [participantCount, setParticipantCount] = useState(1);

  const calculateGrid = () => {
    const currentParticipantCount = webRTCMap.current.size + 1;
    const cols = Math.ceil(Math.sqrt(currentParticipantCount));
    const rows = Math.ceil(currentParticipantCount / cols);
    setGrid({ cols, rows });
    setParticipantCount(currentParticipantCount);
  };

  const toggleVideo = () => {
    localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    return localStreamRef.current.getVideoTracks().every((track) => track.enabled);
  };

  const toggleMic = () => {
    localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    return localStreamRef.current.getAudioTracks().every((track) => track.enabled);
  };

  const joinRoom = async (roomId: string) => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current!.srcObject = localStreamRef.current;

    toggleVideo();
    toggleMic();

    const observableMap = new Map();
    const set = observableMap.set.bind(observableMap);
    const del = observableMap.delete.bind(observableMap);

    observableMap.set = (key: string, value: WebRTCData) => {
      set(key, value);
      calculateGrid();
      return observableMap;
    };

    observableMap.delete = (key: string) => {
      const result = del(key);
      calculateGrid();
      return result;
    };

    webRTCMap.current = observableMap;

    socket.current = signalingClient(localStreamRef.current, webRTCMap.current);
    socket.current.emit('joinRoom', { roomId });
    socket.current.on('receiveMessage', ({ userId, message }) => {
      const { nickName } = webRTCMap.current.get(userId)!;
      console.log(`${nickName}: ${message}`);
    });
  };

  const exitRoom = () => {
    webRTCMap.current.forEach(({ peerConnection }) => {
      peerConnection.close();
    });
    localStreamRef.current.getTracks().forEach((track) => track.stop());
    socket.current.close();
  };

  const sendMessage = (message: string) => {
    socket.current.emit('sendMessage', { message });
  };

  return [
    {
      localVideoRef,
      webRTCMap,
      participantCount,
      grid,
    },
    {
      toggleVideo,
      toggleMic,
      joinRoom,
      exitRoom,
      sendMessage,
    },
  ];
};

export default useWebRTC;
