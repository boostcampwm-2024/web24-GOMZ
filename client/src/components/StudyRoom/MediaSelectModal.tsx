import { useState, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';

import type { MediaSelectModal as MediaSelectModalProps } from '@customTypes/StudyRoom';

import Icon from '@components/common/Icon';

const MediaSelectModal = ({
  className,
  mediaDeviceId,
  setMediaDeviceId,
  getMediaDevices,
}: MediaSelectModalProps) => {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const devices = await getMediaDevices().then((devices) =>
        devices.filter(({ label }) => label !== ''),
      );
      setMediaDevices(devices);
      setIsLoading(false);
    };

    init();
  }, []);

  return (
    <div
      className={`bg-gomz-gray-300 flex h-fit w-fit flex-col justify-center rounded-2xl border p-3 px-6 opacity-80 shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)] ${className}`}
    >
      {isLoading ? (
        <SyncLoader size={5} margin={4} color="#1E1E1E" />
      ) : (
        <>
          {mediaDevices.map((device) => (
            <div key={device.deviceId} className="flex gap-3">
              {mediaDeviceId === device.deviceId ? (
                <Icon id="check" className="text-gomz-black my-1 h-6 w-6 fill-current" />
              ) : (
                <div className="my-1 h-6 w-6" />
              )}
              <button className="truncate py-1" onClick={() => setMediaDeviceId(device.deviceId)}>
                {device.label}
              </button>
            </div>
          ))}
          {mediaDevices.length === 0 && (
            <div className="flex justify-center gap-3 px-5 text-lg font-medium">
              디바이스를 찾을 수 없습니다
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaSelectModal;
