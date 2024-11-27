import { useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import signalingClient from '@socket/signalingClient';

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

interface WebRTCState {
  localStream: MediaStream;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
  participantCount: number;
  grid: { cols: number; rows: number };
}

interface WebRTCControls {
  toggleVideo: () => Promise<boolean>;
  toggleMic: () => boolean;
  joinRoom: (roomId: string) => Promise<Socket>;
  exitRoom: () => void;
  sendMessage: (message: string) => void;
  getVideoDevices: () => Promise<MediaDeviceInfo[]>;
  getAudioDevices: () => Promise<MediaDeviceInfo[]>;
}

const useWebRTC = (): [WebRTCState, WebRTCControls] => {
  const socket = useRef(io());
  const webRTCMap = useRef(new Map<string, WebRTCData>());
  const localStreamRef = useRef(new MediaStream());
  const [localStream, setLocalStream] = useState(new MediaStream());
  const [grid, setGrid] = useState({ cols: 1, rows: 1 });
  const [participantCount, setParticipantCount] = useState(1);

  const calculateGrid = () => {
    const currentParticipantCount = webRTCMap.current.size + 1;
    const cols = Math.ceil(Math.sqrt(currentParticipantCount));
    const rows = Math.ceil(currentParticipantCount / cols);
    setGrid({ cols, rows });
    setParticipantCount(currentParticipantCount);
  };

  const toggleVideo = async () => {
    const currentVideoTrack = localStream.getVideoTracks()[0];

    if (currentVideoTrack) {
      currentVideoTrack.stop();
      localStream.removeTrack(currentVideoTrack);

      webRTCMap.current.forEach(({ peerConnection }) => {
        const sender = peerConnection.getSenders().find(({ track }) => track?.kind === 'video')!;
        peerConnection.removeTrack(sender);
      });

      return false;
    } else {
      const videoTrack = await navigator.mediaDevices
        .getUserMedia({
          video: { deviceId: { ideal: 'default' } },
        })
        .then((stream) => stream.getVideoTracks()[0]);

      localStream.addTrack(videoTrack);

      webRTCMap.current.forEach(({ peerConnection }) => {
        peerConnection.addTrack(videoTrack, localStream);
      });

      return true;
    }
  };

  const toggleMic = () => {
    localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    return localStream.getAudioTracks().every((track) => track.enabled);
  };

  const joinRoom = async (roomId: string) => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { ideal: 'default' } },
    });

    localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = false));

    setLocalStream(localStreamRef.current);

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

    return socket.current;
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

  const getVideoDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  };

  const getAudioDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'audioinput');
  };

  return [
    {
      localStream,
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
      getVideoDevices,
      getAudioDevices,
    },
  ];
};

export default useWebRTC;
