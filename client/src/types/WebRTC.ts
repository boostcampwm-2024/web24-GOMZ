import { Socket } from 'socket.io-client';

interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

interface Configuration {
  iceServers: IceServer[];
}

interface WebRTCData {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  nickName: string;
}

type State = {
  socket: Socket | null;
  localStream: MediaStream;
  webRTCMap: Record<string, WebRTCData>;
  pendingConnectionsMap: Record<string, WebRTCData>;
  curParticipant: number;
  videoDeviceId: string;
  audioDeviceId: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  videoPermission: string;
  audioPermission: string;
};

type Action = {
  addWebRTCData: (socketId: string, webRTCData: Partial<WebRTCData>) => void;
  removeWebRTCData: (socketId: string) => void;
  joinRoom: (roomId: string) => void;
  closeAllConnections: () => void;

  toggleVideo: () => Promise<void>;
  toggleAudio: () => void;
  startAudio: () => void;
  changeVideoDevice: () => Promise<void>;
  changeAudioDevice: () => Promise<void>;
  setVideoDeviceId: (deviceId: string) => void;
  setAudioDeviceId: (deviceId: string) => void;
  setVideoPermission: (permissionState: string) => void;
  setAudioPermission: (permissionState: string) => void;

  sendMessage: (message: string) => void;
};

export type { WebRTCData, Configuration, State, Action };
