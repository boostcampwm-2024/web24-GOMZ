import Header from '@components/common/Header';
import Icon from '@components/common/Icon';

interface StudyRoomHeaderProps {
  className?: string;
  title: string;
  curParticipant: number;
  maxParticipant: number;
  timer: string;
}

const StudyRoomHeader = ({
  className,
  title,
  curParticipant,
  maxParticipant,
  timer,
}: StudyRoomHeaderProps) => {
  return (
    <Header
      className={className}
      title={
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold">{title}</h1>
          <span className="text-gomz-gray-800 font-normal">
            {curParticipant} / {maxParticipant}
          </span>
        </div>
      }
      timer={
        <div className="flex translate-x-[1.125rem] gap-3 text-xl font-normal">
          <div>{timer}</div>
          <button>
            <Icon id="pause" className="h-6 w-6"></Icon>
          </button>
        </div>
      }
      userInfo={<div></div>}
    />
  );
};

export default StudyRoomHeader;
