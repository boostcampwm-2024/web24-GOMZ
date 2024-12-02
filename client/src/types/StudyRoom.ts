interface Header {
  className?: string;
  roomName: string;
  maxParticipant: number;
}

interface ControlBar {
  className?: string;
  toggleChat: () => void;
  isChatOn: boolean;
  unreadMessagesCount: number;
}

interface MediaSelectModal {
  className?: string;
  mediaDeviceId: string;
  setMediaDeviceId: (deviceId: string) => void;
  getMediaDevices: () => Promise<MediaDeviceInfo[]>;
}

interface Video {
  mediaStream: MediaStream;
  muted: boolean;
}

interface VideoOverlay {
  nickName: string;
  dataChannel?: RTCDataChannel;
  cols: number;
}

interface ChatMessage {
  nickName: string;
  message: string;
}

interface Chat {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setLastReadMessageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export type { Header, Video, VideoOverlay, ControlBar, Chat, ChatMessage, MediaSelectModal };
