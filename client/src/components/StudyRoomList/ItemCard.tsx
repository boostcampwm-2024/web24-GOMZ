import { useNavigate } from 'react-router-dom';
import Icon from '@components/common/Icon';

interface ItemCardProps {
  title: string;
  curParticipant: number;
  maxParticipant: number;
  category: string;
  isPrivate: boolean;
  openModal: () => void;
}

const ItemCard = ({
  title,
  curParticipant,
  maxParticipant,
  category,
  isPrivate,
  openModal,
}: ItemCardProps) => {
  const navigate = useNavigate();

  const joinRoom = () => {
    navigate('/studyroom');
  };

  return (
    <div className="hover:bg-gomz-gray-200 flex h-[6.25rem] w-[62.5rem] items-center justify-between rounded-2xl px-6">
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{title}</div>
          <Icon id="group" className="text-gomz-gray-400 h-4 w-4 fill-current" />
          <div className="text-gomz-gray-400 text-sm font-light">
            {curParticipant} / {maxParticipant}
          </div>
        </div>
        <div className="flex gap-1 tracking-widest">
          <div className="bg-gomz-black flex h-7 items-center rounded-full px-3 text-xs text-white">
            #{category}
          </div>
        </div>
      </div>
      <button
        className="font-normal underline-offset-4 hover:underline"
        onClick={() => (isPrivate ? openModal() : joinRoom())}
      >
        입장하기 &gt;
      </button>
    </div>
  );
};

export default ItemCard;
