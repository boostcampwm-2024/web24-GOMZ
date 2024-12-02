import type { WebRTCData } from '@customTypes/WebRTC';

interface Header {
  className?: string;
  roomName: string;
  curParticipant: number;
  maxParticipant: number;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
}

interface VideoGrid {
  localStream: MediaStream;
  webRTCMap: React.MutableRefObject<Map<string, WebRTCData>>;
  grid: { cols: number; rows: number };
}

interface ControlBar {
  className?: string;
  toggleVideo: () => Promise<boolean>;
  toggleMic: () => boolean;
  toggleChat: () => void;
  exitRoom: () => void;
  isChatOn: boolean;
  getVideoDevices: () => Promise<MediaDeviceInfo[]>;
  getAudioDevices: () => Promise<MediaDeviceInfo[]>;
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
  setSelectedVideoDeviceId: React.Dispatch<React.SetStateAction<string>>;
  setSelectedAudioDeviceId: React.Dispatch<React.SetStateAction<string>>;
  unreadMessagesCount: number;
}

interface MediaSelectModal {
  className?: string;
  selectedMediaDeviceId: string;
  setSelectedMediaDevice: React.Dispatch<React.SetStateAction<string>>;
  getMediaDevices: () => Promise<MediaDeviceInfo[]>;
}

interface Video {
  mediaStream: MediaStream;
  muted: boolean;
}

interface VideoOverlay {
  nickName: string;
  dataChannel?: RTCDataChannel;
  gridCols: number;
}

interface ChatMessage {
  nickName: string;
  message: string;
}

interface Chat {
  className?: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (message: string) => void;
  setLastReadMessageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export type {
  Header,
  VideoGrid,
  Video,
  VideoOverlay,
  ControlBar,
  Chat,
  ChatMessage,
  MediaSelectModal,
};
