import Icon from '@components/common/Icon';

const MediaSelectModal = ({ className }: { className: string }) => {
  return (
    <div
      className={`bg-gomz-gray-300 flex h-fit w-80 flex-col justify-center gap-2 rounded-2xl border p-3 px-6 opacity-80 shadow-[0.25rem_0.25rem_0.5rem_0_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="flex gap-3">
        <Icon id="check" className="text-gomz-black h-6 w-6 fill-current" />
        <button className="truncate">Camera Option 1</button>
      </div>
      <div className="flex gap-3">
        <Icon id="check" className="text-gomz-black h-6 w-6 fill-current" />
        <button className="truncate">Camera Option 2</button>
      </div>
      <div className="flex gap-3">
        <Icon id="check" className="text-gomz-black h-6 w-6 fill-current" />
        <button className="truncate">Camera Option 3</button>
      </div>
    </div>
  );
};

export default MediaSelectModal;
