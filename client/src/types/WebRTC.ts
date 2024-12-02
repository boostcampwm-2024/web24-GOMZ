import { Socket } from 'socket.io-client';

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
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
}

interface WebRTCControls {
  toggleVideo: () => Promise<boolean>;
  toggleMic: () => boolean;
  joinRoom: (roomId: string) => Promise<Socket>;
  exitRoom: () => void;
  sendMessage: (message: string) => void;
  getVideoDevices: () => Promise<MediaDeviceInfo[]>;
  getAudioDevices: () => Promise<MediaDeviceInfo[]>;
  setSelectedVideoDeviceId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedAudioDeviceId: React.Dispatch<React.SetStateAction<string>>;
}

export type { WebRTCData, WebRTCState, WebRTCControls };
