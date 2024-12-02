import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { JoinRoomModal as JoinRoomModalProps, ResponseData } from '@customTypes/StudyRoomList';
import { API_BASE_URL } from '@constants/API';
import { SAD_EMOTICONS } from '@constants/EMOTICONS';

import shuffle from '@utils/shuffle';

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
    const form = event.currentTarget;
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
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between gap-1 font-semibold">
          <div className="text-gomz-red text-sm">{errorMessage}</div>
          <div className="flex gap-4">
            <button
              className="border-gomz-black h-8 w-[4.75rem] rounded-full border bg-white transition-transform hover:scale-105"
              onClick={handleCancelJoinRoom}
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-gomz-black text-gomz-white h-8 w-[4.75rem] rounded-full transition-transform hover:scale-105"
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
