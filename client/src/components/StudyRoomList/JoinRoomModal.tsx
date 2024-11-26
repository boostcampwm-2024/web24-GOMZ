import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Room {
  roomId: string;
  roomName: string;
  categoryName: string;
  isPrivate: boolean;
  curParticipant: number;
  maxParticipant: number;
}
interface JoinRoomModalProps {
  currentRoom: Partial<Room>;
  closeModal: () => void;
}

const JoinRoomModal = ({ currentRoom, closeModal }: JoinRoomModalProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const { roomId, maxParticipant } = currentRoom;

  const handlePasswordChange = ({ target }: { target: HTMLInputElement }) => {
    setPassword(target.value);
  };

  const handleCancelJoinRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    closeModal();
  };

  const handleJoinRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 비밀번호 확인 로직
    navigate(`/study-room/${roomId}`, { state: { maxParticipant } });
  };

  return (
    <form
      className="bg-gomz-white border-gomz-black flex h-[11.75rem] w-[25rem] flex-col items-center justify-center gap-6 rounded-2xl border shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)]"
      onSubmit={handleJoinRoom}
    >
      <h3 className="text-xl font-semibold">부스트 캠프 공부방</h3>
      <div className="flex w-full flex-col justify-start gap-4 px-5">
        <div className="flex gap-5">
          <h2 className="w-14 font-semibold">비밀번호</h2>
          <input
            type="password"
            className="border-gomz-black h-8 w-[17.5rem] rounded-lg border px-2 focus:outline-none"
            maxLength={20}
            value={password}
            minLength={4}
            // required={isPrivate ? true : false}
            onChange={handlePasswordChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                navigate(`/study-room/${roomId}`);
              }
            }}
            onInvalid={({ target }: React.InvalidEvent<HTMLInputElement>) => {
              if (target.validity.valueMissing || target.validity.tooShort) {
                target.setCustomValidity('비밀번호는 4자 이상 입력해주세요 ｡° ૮₍°´ᯅ`°₎ა °｡');
              } else {
                target.setCustomValidity('');
              }
            }}
          />
        </div>
        <div className="flex justify-end gap-4 font-semibold">
          <button
            className="border-gomz-black h-8 w-[4.75rem] rounded-full border bg-white"
            onClick={handleCancelJoinRoom}
          >
            취소
          </button>
          <button
            type="submit"
            className="bg-gomz-black text-gomz-white h-8 w-[4.75rem] rounded-full"
          >
            입장
          </button>
        </div>
      </div>
    </form>
  );
};

export default JoinRoomModal;
