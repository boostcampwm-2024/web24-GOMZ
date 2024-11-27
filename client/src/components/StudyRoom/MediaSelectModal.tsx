import { useState, useEffect } from 'react';
import Icon from '@components/common/Icon';

interface MediaSelectModalProps {
  className?: string;
  selectedMediaDeviceId: string;
  setSelectedMediaDevice: React.Dispatch<React.SetStateAction<string>>;
  getMediaDevices: () => Promise<MediaDeviceInfo[]>;
}

const MediaSelectModal = ({
  className,
  selectedMediaDeviceId,
  setSelectedMediaDevice,
  getMediaDevices,
}: MediaSelectModalProps) => {
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const init = async () => {
      const devices = await getMediaDevices();
      setMediaDevices(devices);
    };

    init();
  }, []);

  return (
    <div
      className={`bg-gomz-gray-300 flex h-fit w-fit flex-col justify-center rounded-2xl border p-3 px-6 opacity-80 shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)] ${className}`}
    >
      {mediaDevices.map((device) => (
        <div className="flex gap-3">
          {selectedMediaDeviceId === device.deviceId ? (
            <Icon id="check" className="text-gomz-black my-1 h-6 w-6 fill-current" />
          ) : (
            <div className="my-1 h-6 w-6" />
          )}
          <button
            className="truncate py-1"
            onClick={() => {
              setSelectedMediaDevice(device.deviceId);
            }}
          >
            {device.label}
          </button>
        </div>
      ))}
      {mediaDevices.length === 0 && (
        <div className="flex justify-center gap-3 px-5 text-lg font-medium">
          디바이스를 찾을 수 없습니다
        </div>
      )}
    </div>
  );
};

export default MediaSelectModal;
