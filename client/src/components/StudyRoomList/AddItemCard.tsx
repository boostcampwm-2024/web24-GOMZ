import Icon from '@components/common/Icon';

const AddItemCard = ({ openModal }: { openModal: () => void }) => {
  return (
    <div className="bg-gomz-gray-200 flex h-[6.25rem] w-[62.5rem] items-center justify-between rounded-2xl px-6">
      <div>
        <h4 className="font-semibold">새로운 공부방 만들기 🧸</h4>
        <p className="text-gomz-gray-800 text-sm font-normal">다른 사람들과 함께 공부해보세요</p>
      </div>
      <button
        className="bg-gomz-black relative flex h-11 w-32 items-center justify-center gap-1 rounded-full transition-transform hover:scale-105"
        onClick={openModal}
      >
        <Icon id="plus" className="absolute left-[1.125rem] h-4 w-4 fill-current text-white" />
        <p className="font-normal text-white underline-offset-4">ㅤ공부방 생성</p>
      </button>
    </div>
  );
};

export default AddItemCard;
