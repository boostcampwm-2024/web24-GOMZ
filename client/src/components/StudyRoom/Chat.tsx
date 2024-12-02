import { useEffect, useRef } from 'react';

import type { Chat as ChatProps } from '@customTypes/StudyRoom';

import Icon from '@components/common/Icon';
import ChatMessage from '@components/StudyRoom/ChatMessage';

const Chat = ({
  className,
  messages,
  setMessages,
  newMessage,
  setNewMessage,
  sendMessage,
  setLastReadMessageIndex,
}: ChatProps) => {
  const isFirstRender = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage !== '') {
      sendMessage(newMessage);
      setMessages([
        ...messages,
        { nickName: localStorage.getItem('nickName')!, message: newMessage },
      ]);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current.scrollIntoView({
      behavior: isFirstRender.current ? 'instant' : 'smooth',
    });
    setLastReadMessageIndex(messages.length - 1);
    isFirstRender.current = false;
  }, [messages]);

  return (
    <div
      className={`bg-gomz-white border-gomz-black flex h-[44rem] w-[25rem] flex-col justify-between gap-4 rounded-2xl border py-6 opacity-80 shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)] ${className}`}
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
          <Icon id="send" className="text-gomz-black h-6 w-6 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
