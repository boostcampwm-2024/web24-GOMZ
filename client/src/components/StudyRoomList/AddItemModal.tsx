import { useState } from 'react';
import CATEGORIES from '@constants/CATEGORIES';

const AddItemModal = ({ closeModal }: { closeModal: () => void }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');

  const handleTitleChange = ({ target }: { target: HTMLInputElement }) => {
    setTitle(target.value);
  };

  const handlePasswordChange = ({ target }: { target: HTMLInputElement }) => {
    setPassword(target.value);
  };

  const handleCancelAddRoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    closeModal();
  };

  const handleAddRoom = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 방 생성 API 요청
    closeModal();
  };

  return (
    <form
      className="bg-gomz-white border-gomz-black flex h-60 w-[25rem] flex-col items-center justify-center gap-6 rounded-2xl border shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)]"
      onSubmit={handleAddRoom}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          // 방 생성 API 요청
          console.log('방 생성');
          closeModal();
        }
      }}
    >
      <h3 className="text-xl font-semibold leading-6">공부방 생성</h3>
      <div className="flex w-full flex-col justify-start gap-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h2 className="w-14 font-semibold">제목</h2>
            <input
              className="border-gomz-black h-8 w-48 rounded-lg border p-2 focus:outline-none"
              value={title}
              onChange={handleTitleChange}
              required
              minLength={2}
              onInvalid={({ target }: React.InvalidEvent<HTMLInputElement>) => {
                if (target.validity.valueMissing || target.validity.tooShort) {
                  target.setCustomValidity('공부방 제목은 2자 이상 입력해주세요 ｡° ૮₍°´ᯅ`°₎ა °｡');
                } else {
                  target.setCustomValidity('');
                }
              }}
            />
          </div>
          <div>
            <label className="flex gap-2">
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
            className={`h-8 w-48 rounded-lg border p-2 focus:outline-none`}
            style={{ borderColor: isPrivate ? '#1e1e1e' : '#9f9f9f' }}
            disabled={isPrivate ? false : true}
            maxLength={20}
            value={password}
            onChange={handlePasswordChange}
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
            <select className="border-gomz-black h-8 w-24 truncate rounded-full border bg-white p-1 px-2 text-sm">
              {CATEGORIES.map((category: string) => (
                <option value={category}>#{category}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 font-semibold">
            <button
              className="border-gomz-black h-8 w-[4.75rem] rounded-full border bg-white"
              onClick={handleCancelAddRoom}
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-gomz-black text-gomz-white h-8 w-[4.75rem] rounded-full"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddItemModal;
