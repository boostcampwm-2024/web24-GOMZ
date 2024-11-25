import { useState, useEffect, useRef } from 'react';
import Icon from '@components/common/Icon';

interface ChatProps {
  sendMessage: (message: string) => void;
  className?: string;
}

const ChatMessage = ({ nickName, message }: { nickName: string; message: string }) => {
  return (
    <div className="mb-2">
      <span className="mr-2 font-semibold">{nickName}</span>
      <span className="break-words">{message}</span>
    </div>
  );
};

const Chat = ({ sendMessage, className }: ChatProps) => {
  const [messages, setMessages] = useState([
    { nickName: '귀여운 요정', message: '안녕하세요! 환영합니다 :)' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current!.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage !== '') {
      sendMessage(newMessage);
      setMessages([...messages, { nickName: '배고픈 해파리', message: newMessage }]);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  return (
    <div
      className={`bg-gomz-white border-gomz-black flex h-[44rem] w-[25rem] flex-col justify-between gap-4 rounded-2xl border py-6 shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)] ${className}`}
    >
      <h2 className="mx-auto px-6 text-xl font-bold">🧸 채팅 💬</h2>
      <div className="mx-auto h-[38rem] w-[23rem] overflow-y-auto px-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} nickName={msg.nickName} message={msg.message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-gomz-black mx-auto flex h-8 w-[23rem] items-center justify-center gap-1 rounded-lg border bg-white">
        <input
          className="h-7 w-80 bg-none px-2 focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        ></input>
        <button onClick={handleSendMessage}>
          <Icon id="send" className="text-gomz-black h-7 w-7 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
