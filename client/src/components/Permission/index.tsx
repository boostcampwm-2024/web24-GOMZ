import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import { checkPermission, requestPermission } from '@utils/media';
import Icon from '@components/common/Icon';

const Permission = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { roomId } = useParams();
  const [deniedDevice, setDeniedDevice] = useState('');
  const [isCameraDenied, setIsCameraDenied] = useState(false);
  const [isMicDenied, setIsMicDenied] = useState(false);

  if (!state) {
    navigate(`/study-room-list`, { replace: true });
  }

  const checkAllPermissions = async () => {
    const cameraPermissionState = await checkPermission('camera');
    const micPermissionState = await checkPermission('microphone');

    if (cameraPermissionState === 'denied' && micPermissionState === 'denied') {
      setDeniedDevice('카메라와 마이크');
      setIsCameraDenied(true);
      setIsMicDenied(true);
    } else if (cameraPermissionState === 'denied') {
      setDeniedDevice('카메라');
      setIsCameraDenied(true);
    } else if (micPermissionState === 'denied') {
      setDeniedDevice('마이크');
      setIsMicDenied(true);
    } else if (cameraPermissionState === 'granted' || micPermissionState === 'granted') {
      navigate(`/study-room/${roomId}`, { state, replace: true });
    }
  };

  const handleClick = async (cameraPermission: boolean, micPermission: boolean) => {
    try {
      await requestPermission(cameraPermission, micPermission);
      navigate(`/study-room/${roomId}`, { state, replace: true });
    } catch {
      await checkAllPermissions();
    }
  };

  useEffect(() => {
    checkAllPermissions();
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center">
      <div className="flex h-[56.25rem] w-[90rem] flex-col items-center justify-center p-4">
        <div className="flex w-[42rem] flex-col justify-center gap-8 rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">공부방 권한 설정</h1>
            <p className="text-gray-600">사용하실 디바이스를 선택해주세요</p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => handleClick(true, true)}
              disabled={isCameraDenied || isMicDenied}
              className="group relative flex w-36 flex-col items-center rounded-xl border-2 border-gray-200 p-7 hover:enabled:border-blue-500 disabled:border-red-300 disabled:bg-red-50"
            >
              <div className="text-gomz-black mb-3 rounded-full bg-gray-100 p-3 group-disabled:bg-white group-disabled:text-red-400">
                <Icon id="check" className="h-6 w-6 fill-current" />
              </div>
              <span className="font-medium text-gray-900 group-disabled:text-red-400">
                모두 사용
              </span>
              <span className="pt-1 text-center text-xs text-gray-500 group-disabled:text-red-400">
                카메라와 마이크 모두 사용
              </span>
            </button>
            <button
              onClick={() => handleClick(true, false)}
              disabled={isCameraDenied}
              className="group relative flex w-36 flex-col items-center rounded-xl border-2 border-gray-200 p-7 hover:enabled:border-blue-500 disabled:border-red-300 disabled:bg-red-50"
            >
              <div className="text-gomz-black mb-3 rounded-full bg-gray-100 p-3 group-disabled:bg-white group-disabled:text-red-400">
                <Icon id="video" className="h-6 w-6 fill-current" />
              </div>
              <span className="font-medium text-gray-900 group-disabled:text-red-400">카메라</span>
              <span className="pt-1 text-center text-xs text-gray-500 group-disabled:text-red-400">
                카메라만 사용
              </span>
            </button>
            <button
              onClick={() => handleClick(false, true)}
              disabled={isMicDenied}
              className="group relative flex w-36 flex-col items-center rounded-xl border-2 border-gray-200 p-7 hover:enabled:border-blue-500 disabled:border-red-300 disabled:bg-red-50"
            >
              <div className="text-gomz-black mb-3 rounded-full bg-gray-100 p-3 group-disabled:bg-white group-disabled:text-red-400">
                <Icon id="mic" className="h-6 w-6 fill-current" />
              </div>
              <span className="font-medium text-gray-900 group-disabled:text-red-400">마이크</span>
              <span className="pt-1 text-center text-xs text-gray-500 group-disabled:text-red-400">
                마이크만 사용
              </span>
            </button>
            <button
              onClick={() => handleClick(false, false)}
              className="group relative flex w-36 flex-col items-center rounded-xl border-2 border-gray-200 p-7 hover:enabled:border-blue-500 disabled:border-red-300 disabled:bg-red-50"
            >
              <div className="text-gomz-black mb-3 rounded-full bg-gray-100 p-3 group-disabled:bg-white group-disabled:text-red-400">
                <Icon id="plus" className="h-6 w-6 rotate-45 fill-current" />
              </div>
              <span className="font-medium text-gray-900 group-disabled:text-red-400">미사용</span>
              <span className="pt-1 text-center text-xs text-gray-500 group-disabled:text-red-400">
                카메라와 마이크 미사용
              </span>
            </button>
          </div>

          {deniedDevice && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-gomz-red text-sm font-medium">
                ⚠️ㅤ{deniedDevice} 권한이 거부되어 있습니다.{' '}
                <a
                  href="https://support.google.com/chrome/answer/2693767?hl=ko&co=GENIE.Platform%3DDesktop"
                  target="_blank"
                  className="underline"
                >
                  설정에서 권한을 확인해주세요.
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permission;
