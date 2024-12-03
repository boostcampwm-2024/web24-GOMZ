import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropagateLoader } from 'react-spinners';

import { CATEGORY_NAMES } from '@constants/CATEGORY';
import { API_BASE_URL } from '@constants/API';

const AddItemModal = ({ closeModal }: { closeModal: () => void }) => {
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelAddRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    closeModal();
  };

  const sendFormData = async (form: HTMLFormElement) => {
    setIsLoading(true);

    const formData = new FormData(form);
    const jsonData = {
      roomName: formData.get('roomName'),
      password: formData.get('password'),
      categoryName: formData.get('categoryName'),
    };

    const resonse = await fetch(`${API_BASE_URL}/study-room/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });

    const { roomId } = await resonse.json();

    navigate(`/permission/${roomId}`, {
      state: { roomName: jsonData.roomName, maxParticipant: 8 },
    });
  };

  const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    sendFormData(form);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const form = event.currentTarget;
      if (form.checkValidity()) {
        sendFormData(form);
      } else {
        form.reportValidity();
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <PropagateLoader size={13} color="#1E1E1E" />
      ) : (
        <form
          className="bg-gomz-white border-gomz-black flex h-60 w-[25rem] flex-col items-center justify-center gap-6 rounded-2xl border shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)]"
          onSubmit={handleOnSubmit}
          onKeyDown={handleOnKeyDown}
        >
          <h3 className="text-xl font-semibold leading-6">공부방 생성</h3>
          <div className="flex w-full flex-col justify-start gap-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <h2 className="w-14 font-semibold">제목</h2>
                <input
                  className="border-gomz-black h-8 w-48 rounded-lg border p-2 focus:outline-none"
                  name="roomName"
                  required
                  minLength={2}
                  onInvalid={({ target }: React.InvalidEvent<HTMLInputElement>) => {
                    if (target.validity.valueMissing || target.validity.tooShort) {
                      target.setCustomValidity(
                        '공부방 제목은 2자 이상 입력해주세요 ｡° ૮₍°´ᯅ`°₎ა °｡',
                      );
                    } else {
                      target.setCustomValidity('');
                    }
                  }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <span className="text-sm">비밀방</span>
                  <input
                    type="checkbox"
                    className="accent-gomz-black h-4 w-4"
                    onChange={() => setIsPrivate(!isPrivate)}
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <h2 className="w-14 font-semibold">비밀번호</h2>
              <input
                type="password"
                name="password"
                className={`h-8 w-48 rounded-lg border p-2 focus:outline-none`}
                style={{ borderColor: isPrivate ? '#1e1e1e' : '#9f9f9f' }}
                disabled={isPrivate ? false : true}
                maxLength={20}
                required={isPrivate ? true : false}
                minLength={4}
                onInvalid={({ target }: React.InvalidEvent<HTMLInputElement>) => {
                  if (target.validity.valueMissing || target.validity.tooShort) {
                    target.setCustomValidity('비밀번호는 4자 이상 입력해주세요 ｡° ૮₍°´ᯅ`°₎ა °｡');
                  } else {
                    target.setCustomValidity('');
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <h2 className="w-14 font-semibold">카테고리</h2>
                <select
                  className="border-gomz-black h-8 w-24 truncate rounded-full border bg-white p-1 px-2 text-sm"
                  name="categoryName"
                >
                  {CATEGORY_NAMES.map((categoryName: string) => (
                    <option key={categoryName} value={categoryName}>
                      #{categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 font-semibold">
                <button
                  className="border-gomz-black h-8 w-[4.75rem] rounded-full border bg-white transition-transform hover:scale-105"
                  onClick={handleCancelAddRoom}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-gomz-black text-gomz-white h-8 w-[4.75rem] rounded-full transition-transform hover:scale-105"
                >
                  생성
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddItemModal;
