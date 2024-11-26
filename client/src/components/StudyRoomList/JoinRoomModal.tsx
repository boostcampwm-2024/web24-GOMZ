import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shuffle from '@utils/shuffle';

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

interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

interface ResponseData {
  canAccess: boolean;
  error?: ErrorResponse;
}

const API_BASE_URL = import.meta.env.DEV ? 'api' : import.meta.env.VITE_SIGNALING_SERVER_URL;
const SAD_EMOTICONS = [
  '｡° ૮₍°´ᯅ`°₎ა °',
  '｡° (ꢳࡇꢳ) °｡',
  '༼ ༎ຶ ෴ ༎ຶ༽',
  '꒰ 𖦹ˊᯅˋ𖦹 ꒱',
  '✘ᴗ✘',
  'ヽ(●´Д｀●)ﾉﾟ',
];

const JoinRoomModal = ({ currentRoom, closeModal }: JoinRoomModalProps) => {
  const navigate = useNavigate();
  const { roomId, roomName, maxParticipant } = currentRoom;
  const [errorMessage, setErrorMessage] = useState('');

  const handleCancelJoinRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    closeModal();
  };

  const sendFormData = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const password = formData.get('password');

    const resonse = await fetch(
      `${API_BASE_URL}/study-room/check?roomId=${roomId}&password=${password}`,
    );

    const { canAccess, error }: ResponseData = await resonse.json();
    if (canAccess) {
      navigate(`/study-room/${roomId}`, { state: { roomName, maxParticipant } });
    } else if (error?.statusCode === 404) {
      navigate(0);
    } else {
      setErrorMessage(`잘못된 비밀번호 ${shuffle(SAD_EMOTICONS)[0]}`);
    }
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    sendFormData(form);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendFormData(event.currentTarget);
    }
  };

  return (
    <form
      className="bg-gomz-white border-gomz-black flex h-[11.75rem] w-[25rem] flex-col items-center justify-center gap-6 rounded-2xl border shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)]"
      onSubmit={handleOnSubmit}
      onKeyDown={handleOnKeyDown}
    >
      <h3 className="text-xl font-semibold">{roomName}</h3>
      <div className="flex w-full flex-col justify-start gap-4 px-5">
        <div className="flex items-center gap-5">
          <h2 className="w-14 font-semibold">비밀번호</h2>
          <input
            type="password"
            name="password"
            className="border-gomz-black h-8 w-[17.5rem] rounded-lg border px-2 focus:outline-none"
            maxLength={20}
            minLength={4}
            required
            onInvalid={({ target }: React.InvalidEvent<HTMLInputElement>) => {
              if (target.validity.valueMissing || target.validity.tooShort) {
                target.setCustomValidity('비밀번호는 4자 이상 입력해주세요 ｡° ૮₍°´ᯅ`°₎ა °｡');
              } else {
                target.setCustomValidity('');
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-1 font-semibold">
          <div className="text-gomz-red text-sm">{errorMessage}</div>
          <div className="flex gap-4">
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
      </div>
    </form>
  );
};

export default JoinRoomModal;
