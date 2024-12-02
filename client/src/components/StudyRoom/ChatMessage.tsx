import type { ChatMessage as ChatMessageProps } from '@customTypes/StudyRoom';

const ChatMessage = ({ nickName, message }: ChatMessageProps) => {
  return (
    <div className="mb-2 rounded-xl">
      <span className="mr-2 font-semibold">{nickName}</span>
      <span className="break-words">{message}</span>
    </div>
  );
};

export default ChatMessage;
